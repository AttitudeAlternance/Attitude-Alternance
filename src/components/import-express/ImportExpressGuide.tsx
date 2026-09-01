"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

// Code du raccourci "glisser-déposer" (bookmarklet), validé manuellement sur LinkedIn, Indeed,
// HelloWork et Welcome to the Jungle (voir échanges du 01/09/2026). Il repère le poste et
// l'entreprise en priorité via les données structurées que les sites intègrent pour Google
// ("Google for Jobs"), sinon via le titre affiché sur la page (en écartant les titres parasites
// comme "0 notification" ou "Emplois suggérés") ; il coupe la description aux bonnes limites via
// des phrases-repères propres aux sites d'offres français, et clique automatiquement les boutons
// "Voir plus" repérés dans la zone de contenu identifiée (jamais dans un pied de page, un menu ou
// un bandeau cookies/consentement, pour éviter de faire quitter la page par erreur).
// Non fiable à 100% par nature (dépend de la structure de chaque site) : mieux vaut laisser un
// champ vide à corriger qu'une information fausse, d'où plusieurs champs qui restent vides sur
// certains sites plutôt que de deviner.
const BOOKMARKLET_CODE = "(async function(){ function stripAccents(s){ return s.normalize ? s.normalize('NFD').replace(/[̀-ͯ]/g,'') : s; } var START_MARKERS = ['les missions du poste','descriptif du poste','description du poste','detail du poste','profil recherche','vos missions','a propos du poste','le poste :','job description','missions du poste']; var END_MARKERS = ['voir plus d\\'offres','recherches similaires','offres similaires','postes similaires','informations legales','les sites','l\\'emploi offres d\\'emploi','politique de confidentialite','gerer les traceurs','aide et contact','tous droits reserves','mentions legales','signaler l\\'offre d\\'emploi','hiring lab','parcourir les emplois','parcourir les entreprises','salaires indeed','travailler chez indeed','centre de confidentialite','conditions d\\'utilisation','accessibilite sur indeed'];  function computeContentBounds(fullText){ var lower = stripAccents(fullText.toLowerCase()); var startIdx = -1; for (var i=0;i<START_MARKERS.length;i++){ var idx = lower.indexOf(stripAccents(START_MARKERS[i])); if (idx !== -1 && (startIdx === -1 || idx < startIdx)) startIdx = idx; } var searchBase = startIdx !== -1 ? fullText.slice(startIdx) : fullText; var lowerAfter = stripAccents(searchBase.toLowerCase()); var endIdxRel = -1; for (var j=0;j<END_MARKERS.length;j++){ var idx2 = lowerAfter.indexOf(stripAccents(END_MARKERS[j])); if (idx2 !== -1 && (endIdxRel === -1 || idx2 < endIdxRel)) endIdxRel = idx2; } var absStart = startIdx !== -1 ? startIdx : 0; var absEnd = endIdxRel !== -1 ? absStart + endIdxRel : fullText.length; return { start: absStart, end: absEnd, matched: startIdx !== -1 }; }  function computeClickWindow(fullText, h1Text){ var bounds = computeContentBounds(fullText); if (bounds.matched) return bounds; if (h1Text){ var idx = fullText.indexOf(h1Text); if (idx !== -1) return { start: idx, end: Math.min(fullText.length, idx + 6000) }; } return { start: 0, end: fullText.length }; }  function isInExcludedRegion(el){ var blockedWords = ['cookie','consent','tarteaucitron','onetrust','didomi','axeptio','cookiebot','gdpr','rgpd','footer']; var cur = el; var hops = 0; while (cur && cur.tagName && hops < 20){ var tag = cur.tagName.toLowerCase(); if (tag === 'footer' || tag === 'nav') return true; var cls = (cur.className && cur.className.toString) ? cur.className.toString().toLowerCase() : ''; var idAttr = (cur.id || '').toLowerCase(); var role = cur.getAttribute ? (cur.getAttribute('role') || '') : ''; if (role === 'navigation') return true; for (var w=0; w<blockedWords.length; w++){ if (cls.indexOf(blockedWords[w]) !== -1 || idAttr.indexOf(blockedWords[w]) !== -1) return true; } if (tag === 'body' || tag === 'html') break; cur = cur.parentElement; hops++; } return false; }  function clickExpandToggles(windowText){ var phrases = ['voir plus','lire la suite','afficher plus','en savoir plus','show more','read more','developper','voir la suite']; var denylist = ['offres','photos','images','similaires','recherches','articles']; var nodes = document.querySelectorAll('button, a, span, div, [role=button]'); var clicked = 0; var lowerWindow = stripAccents(windowText.toLowerCase()); for (var i=0;i<nodes.length;i++){ var el = nodes[i]; var rawTxt = (el.innerText || el.textContent || '').trim(); var txt = stripAccents(rawTxt.toLowerCase()); if (!txt || txt.length > 60) continue; var hasDenied = false; for (var d=0;d<denylist.length;d++){ if (txt.indexOf(denylist[d]) !== -1){ hasDenied = true; break; } } if (hasDenied) continue; var isMatch = false; for (var p=0;p<phrases.length;p++){ if (txt.indexOf(phrases[p]) !== -1){ isMatch = true; break; } } if (!isMatch) continue; if (isInExcludedRegion(el)) continue; if (lowerWindow.indexOf(txt) === -1) continue; if (el.tagName === 'A'){ var href = el.getAttribute('href'); if (href && href !== '#' && href.indexOf('javascript:') !== 0) continue; } try { el.click(); clicked++; } catch(e){} } return clicked; }  function extractJobText(fullText){ var bounds = computeContentBounds(fullText); var result = fullText.slice(bounds.start, bounds.end); return result.trim().length > 200 ? result : fullText; } function directText(el){ var txt = ''; for (var i=0;i<el.childNodes.length;i++){ var node = el.childNodes[i]; if (node.nodeType === 3) txt += node.textContent; } return txt.replace(/\\s+/g,' ').trim(); } function stripSiteBrandSuffix(rawTitle){ var brands = ['hellowork','linkedin','indeed','welcome to the jungle','wttj','apec','pole emploi','france travail','monster','glassdoor','keljob','regionsjob','cadremploi']; var seps = [' | ', ' - ', ' — ']; var cleaned = rawTitle; for (var i=0;i<seps.length;i++){ var idx = cleaned.lastIndexOf(seps[i]); if (idx === -1) continue; var tail = cleaned.slice(idx + seps[i].length).toLowerCase(); var isBrand = false; for (var b=0;b<brands.length;b++){ if (tail.indexOf(brands[b]) !== -1){ isBrand = true; break; } } if (isBrand){ cleaned = cleaned.slice(0, idx).trim(); break; } } return cleaned; } function extractCompanyFromTitle(rawTitle){ var cleaned = stripSiteBrandSuffix(rawTitle); var m = cleaned.match(/(?:recrutement par|chez|par)\\s+(.+)$/i); if (m && m[1] && m[1].trim().length > 1 && m[1].trim().length < 60) return m[1].trim(); return ''; }  function getJobPostingJsonLd(){ try { var scripts = []; var allScripts = document.getElementsByTagName('script'); for (var s=0; s<allScripts.length; s++){ var typeAttr = (allScripts[s].getAttribute('type') || '').toLowerCase(); if (typeAttr.indexOf('ld+json') !== -1) scripts.push(allScripts[s]); } for (var i=0;i<scripts.length;i++){ try { var data = JSON.parse(scripts[i].textContent); var candidates = Array.isArray(data) ? data : [data]; for (var j=0;j<candidates.length;j++){ var item = candidates[j]; if (!item) continue; var itemType = item['@type']; var isJobPosting = itemType === 'JobPosting' || (Array.isArray(itemType) && itemType.indexOf('JobPosting') !== -1); if (isJobPosting) return item; if (item['@graph'] && Array.isArray(item['@graph'])){ for (var k=0;k<item['@graph'].length;k++){ var g = item['@graph'][k]; if (g && g['@type'] === 'JobPosting') return g; } } } } catch(e){} } } catch(e){} return null; }  function isJunkHeading(txt){ var junk = ['notification','bienvenue','menu','accueil','recherche','panier','se connecter','connexion','mon compte','deconnexion','parametres','navigation','emplois suggeres','offres suggerees','postes suggeres','suggested job','similar job','offres similaires','recommande pour vous','recommandations']; var low = stripAccents(txt.toLowerCase()); for (var jz=0; jz<junk.length; jz++){ if (low.indexOf(junk[jz]) !== -1) return true; } return false; } var headingCandidates = document.querySelectorAll('h1, h2, [role=heading]'); var h1Text = ''; for (var hc=0; hc<headingCandidates.length; hc++){ var cand = headingCandidates[hc]; var dt = directText(cand); var candText = (dt.length > 2 && dt.length < 120) ? dt : (cand.innerText || '').trim().slice(0,120); if (candText && !isJunkHeading(candText)){ h1Text = candText; break; } } if (!h1Text){ h1Text = stripSiteBrandSuffix((document.title || '').trim()).slice(0,120); }  var totalClicks = 0; for (var pass=0; pass<2; pass++){ var rawNow = document.body ? document.body.innerText : ''; var win = computeClickWindow(rawNow, h1Text); var windowText = rawNow.slice(win.start, win.end); var n = clickExpandToggles(windowText); totalClicks += n; if (n === 0) break; await new Promise(function(res){ setTimeout(res, 400); }); }  var t = document.title || ''; var raw = document.body ? document.body.innerText : ''; var cleaned = extractJobText(raw); var x = cleaned.replace(/\\s+/g,' ').trim(); var mx = 6000; if (x.length>mx) x = x.slice(0,mx); var u = window.location.href; var jsonLd = getJobPostingJsonLd(); var roleFromLd = (jsonLd && jsonLd.title) ? String(jsonLd.title).trim().slice(0,120) : ''; var companyFromLd = (jsonLd && jsonLd.hiringOrganization && jsonLd.hiringOrganization.name) ? String(jsonLd.hiringOrganization.name).trim().slice(0,120) : ''; var r = roleFromLd || h1Text; var c = companyFromLd || extractCompanyFromTitle(t); var base='https://attitude-alternance.fr/dashboard/applications'; var q=new URLSearchParams(); if(c)q.set('prefillCompany',c); if(r)q.set('prefillRole',r); q.set('prefillUrl',u); q.set('prefillDescription',x); window.open(base+'?'+q.toString(),'_blank'); })();";
const BOOKMARKLET_HREF = "javascript:" + BOOKMARKLET_CODE;

export function ImportExpressGuide() {
  const [copied, setCopied] = useState(false);

  async function handleCopyLink() {
    await navigator.clipboard.writeText(BOOKMARKLET_HREF);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <h2 className="font-display text-lg font-semibold text-ink">Ajoute une candidature en 20 secondes</h2>
        <p className="mt-2 text-sm text-ink/80">
          Installe ce raccourci une seule fois : ensuite, depuis n&apos;importe quelle offre (LinkedIn, Indeed,
          HelloWork, Welcome to the Jungle...), un clic ouvre directement la fenêtre d&apos;ajout de candidature,
          déjà remplie autant que possible.
        </p>

        <div className="mt-5 rounded-2xl border border-dashed border-primary-200 bg-primary-50 p-6 text-center">
          <p className="mb-3 text-sm font-medium text-primary-600">↓ Glisse ce bouton dans ta barre de favoris ↓</p>
          
            href={BOOKMARKLET_HREF}
            onClick={(e) => e.preventDefault()}
            className="inline-flex cursor-grab select-none items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-pop active:cursor-grabbing"
          >
            + Ajouter à Attitude Alternance
          </a>
          <p className="mt-3 text-xs text-primary-500/80">
            Tu ne vois pas ta barre de favoris ? Fais Ctrl+Maj+B (Windows) ou Cmd+Maj+B (Mac) pour l&apos;afficher,
            puis reviens ici.
          </p>
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium text-ink">Le glisser-déposer ne fonctionne pas ? Installe-le à la main :</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-ink/80">
            <li>Clic droit sur ta barre de favoris → « Ajouter une page ».</li>
            <li>Donne-lui le nom que tu veux, par exemple « Ajouter à Attitude Alternance ».</li>
            <li>Copie le lien ci-dessous et colle-le dans le champ URL, puis valide.</li>
          </ol>
          <div className="mt-3 flex items-start gap-2">
            <code className="max-h-24 flex-1 overflow-y-auto break-all rounded-lg bg-paper/60 p-3 text-xs text-ink/60">
              {BOOKMARKLET_HREF}
            </code>
            <Button type="button" size="sm" variant="secondary" onClick={handleCopyLink}>
              {copied ? "Copié ✓" : "Copier"}
            </Button>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-warn-50 p-4 text-xs text-warn">
          ⚠ Fonctionne uniquement sur ordinateur (pas sur mobile). Ça marche bien sur la plupart des sites
          d&apos;offres, mais pas à 100% selon leur mise en page : vérifie et complète les champs si besoin avant
          de valider — mieux vaut un champ vide à corriger qu&apos;une information fausse.
        </div>
      </Card>

      <Card>
        <h2 className="font-display text-base font-semibold text-ink">Comment ça marche</h2>
        <ol className="mt-3 space-y-2.5 text-sm text-ink/80">
          <li><span className="font-semibold text-primary">1.</span> Installe le bouton une seule fois (ci-contre).</li>
          <li><span className="font-semibold text-primary">2.</span> Va sur une offre qui t&apos;intéresse (LinkedIn, Indeed, HelloWork...).</li>
          <li><span className="font-semibold text-primary">3.</span> Clique sur le favori installé dans ta barre.</li>
          <li><span className="font-semibold text-primary">4.</span> La fenêtre « Ajouter une candidature » s&apos;ouvre, déjà remplie.</li>
          <li><span className="font-semibold text-primary">5.</span> Vérifie, complète si besoin, et valide.</li>
        </ol>
      </Card>
    </div>
  );
}
