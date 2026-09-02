"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

// Code du raccourci "glisser-depose" (bookmarklet), valide manuellement sur LinkedIn, Indeed,
// HelloWork et Welcome to the Jungle (voir echanges du 01/09/2026). Il repere le poste et
// l'entreprise en priorite via les donnees structurees que les sites integrent pour Google
// ("Google for Jobs"), sinon via le titre affiche sur la page (en ecartant les titres parasites
// comme "0 notification" ou "Emplois suggeres") ; il coupe la description aux bonnes limites via
// des phrases-reperes propres aux sites d'offres francais, et clique automatiquement les boutons
// "Voir plus" reperes dans la zone de contenu identifiee (jamais dans un pied de page, un menu ou
// un bandeau cookies/consentement, pour eviter de faire quitter la page par erreur).
// Non fiable a 100% par nature (depend de la structure de chaque site) : mieux vaut laisser un
// champ vide a corriger qu'une information fausse, d'ou plusieurs champs qui restent vides sur
// certains sites plutot que de deviner.
//
// Le code ci-dessous est stocke encode en base64 (uniquement des lettres, chiffres, "+", "/", "=")
// plutot qu'en texte brut : ca evite tout probleme de guillemets, d'antislashs ou de caracteres
// speciaux qui pourraient etre alteres lors d'un copier-coller dans l'editeur GitHub.
const BOOKMARKLET_CODE_B64 =
  "KGFzeW5jIGZ1bmN0aW9uKCl7IGZ1bmN0aW9uIHN0cmlwQWNjZW50cyhzKXsgcmV0dXJuIHMubm9ybWFsaXplID8gcy5ub3JtYWxp" +
  "emUoJ05GRCcpLnJlcGxhY2UoL1tcdTAzMDAtXHUwMzZmXS9nLCcnKSA6IHM7IH0gdmFyIFNUQVJUX01BUktFUlMgPSBbJ2xlcyBt" +
  "aXNzaW9ucyBkdSBwb3N0ZScsJ2Rlc2NyaXB0aWYgZHUgcG9zdGUnLCdkZXNjcmlwdGlvbiBkdSBwb3N0ZScsJ2RldGFpbCBkdSBw" +
  "b3N0ZScsJ3Byb2ZpbCByZWNoZXJjaGUnLCd2b3MgbWlzc2lvbnMnLCdhIHByb3BvcyBkdSBwb3N0ZScsJ2xlIHBvc3RlIDonLCdq" +
  "b2IgZGVzY3JpcHRpb24nLCdtaXNzaW9ucyBkdSBwb3N0ZSddOyB2YXIgRU5EX01BUktFUlMgPSBbJ3ZvaXIgcGx1cyBkXCdvZmZy" +
  "ZXMnLCdyZWNoZXJjaGVzIHNpbWlsYWlyZXMnLCdvZmZyZXMgc2ltaWxhaXJlcycsJ3Bvc3RlcyBzaW1pbGFpcmVzJywnaW5mb3Jt" +
  "YXRpb25zIGxlZ2FsZXMnLCdsZXMgc2l0ZXMnLCdsXCdlbXBsb2kgb2ZmcmVzIGRcJ2VtcGxvaScsJ3BvbGl0aXF1ZSBkZSBjb25m" +
  "aWRlbnRpYWxpdGUnLCdnZXJlciBsZXMgdHJhY2V1cnMnLCdhaWRlIGV0IGNvbnRhY3QnLCd0b3VzIGRyb2l0cyByZXNlcnZlcycs" +
  "J21lbnRpb25zIGxlZ2FsZXMnLCdzaWduYWxlciBsXCdvZmZyZSBkXCdlbXBsb2knLCdoaXJpbmcgbGFiJywncGFyY291cmlyIGxl" +
  "cyBlbXBsb2lzJywncGFyY291cmlyIGxlcyBlbnRyZXByaXNlcycsJ3NhbGFpcmVzIGluZGVlZCcsJ3RyYXZhaWxsZXIgY2hleiBp" +
  "bmRlZWQnLCdjZW50cmUgZGUgY29uZmlkZW50aWFsaXRlJywnY29uZGl0aW9ucyBkXCd1dGlsaXNhdGlvbicsJ2FjY2Vzc2liaWxp" +
  "dGUgc3VyIGluZGVlZCddOyAgZnVuY3Rpb24gY29tcHV0ZUNvbnRlbnRCb3VuZHMoZnVsbFRleHQpeyB2YXIgbG93ZXIgPSBzdHJp" +
  "cEFjY2VudHMoZnVsbFRleHQudG9Mb3dlckNhc2UoKSk7IHZhciBzdGFydElkeCA9IC0xOyBmb3IgKHZhciBpPTA7aTxTVEFSVF9N" +
  "QVJLRVJTLmxlbmd0aDtpKyspeyB2YXIgaWR4ID0gbG93ZXIuaW5kZXhPZihzdHJpcEFjY2VudHMoU1RBUlRfTUFSS0VSU1tpXSkp" +
  "OyBpZiAoaWR4ICE9PSAtMSAmJiAoc3RhcnRJZHggPT09IC0xIHx8IGlkeCA8IHN0YXJ0SWR4KSkgc3RhcnRJZHggPSBpZHg7IH0g" +
  "dmFyIHNlYXJjaEJhc2UgPSBzdGFydElkeCAhPT0gLTEgPyBmdWxsVGV4dC5zbGljZShzdGFydElkeCkgOiBmdWxsVGV4dDsgdmFy" +
  "IGxvd2VyQWZ0ZXIgPSBzdHJpcEFjY2VudHMoc2VhcmNoQmFzZS50b0xvd2VyQ2FzZSgpKTsgdmFyIGVuZElkeFJlbCA9IC0xOyBm" +
  "b3IgKHZhciBqPTA7ajxFTkRfTUFSS0VSUy5sZW5ndGg7aisrKXsgdmFyIGlkeDIgPSBsb3dlckFmdGVyLmluZGV4T2Yoc3RyaXBB" +
  "Y2NlbnRzKEVORF9NQVJLRVJTW2pdKSk7IGlmIChpZHgyICE9PSAtMSAmJiAoZW5kSWR4UmVsID09PSAtMSB8fCBpZHgyIDwgZW5k" +
  "SWR4UmVsKSkgZW5kSWR4UmVsID0gaWR4MjsgfSB2YXIgYWJzU3RhcnQgPSBzdGFydElkeCAhPT0gLTEgPyBzdGFydElkeCA6IDA7" +
  "IHZhciBhYnNFbmQgPSBlbmRJZHhSZWwgIT09IC0xID8gYWJzU3RhcnQgKyBlbmRJZHhSZWwgOiBmdWxsVGV4dC5sZW5ndGg7IHJl" +
  "dHVybiB7IHN0YXJ0OiBhYnNTdGFydCwgZW5kOiBhYnNFbmQsIG1hdGNoZWQ6IHN0YXJ0SWR4ICE9PSAtMSB9OyB9ICBmdW5jdGlv" +
  "biBjb21wdXRlQ2xpY2tXaW5kb3coZnVsbFRleHQsIGgxVGV4dCl7IHZhciBib3VuZHMgPSBjb21wdXRlQ29udGVudEJvdW5kcyhm" +
  "dWxsVGV4dCk7IGlmIChib3VuZHMubWF0Y2hlZCkgcmV0dXJuIGJvdW5kczsgaWYgKGgxVGV4dCl7IHZhciBpZHggPSBmdWxsVGV4" +
  "dC5pbmRleE9mKGgxVGV4dCk7IGlmIChpZHggIT09IC0xKSByZXR1cm4geyBzdGFydDogaWR4LCBlbmQ6IE1hdGgubWluKGZ1bGxU" +
  "ZXh0Lmxlbmd0aCwgaWR4ICsgNjAwMCkgfTsgfSByZXR1cm4geyBzdGFydDogMCwgZW5kOiBmdWxsVGV4dC5sZW5ndGggfTsgfSAg" +
  "ZnVuY3Rpb24gaXNJbkV4Y2x1ZGVkUmVnaW9uKGVsKXsgdmFyIGJsb2NrZWRXb3JkcyA9IFsnY29va2llJywnY29uc2VudCcsJ3Rh" +
  "cnRlYXVjaXRyb24nLCdvbmV0cnVzdCcsJ2RpZG9taScsJ2F4ZXB0aW8nLCdjb29raWVib3QnLCdnZHByJywncmdwZCcsJ2Zvb3Rl" +
  "ciddOyB2YXIgY3VyID0gZWw7IHZhciBob3BzID0gMDsgd2hpbGUgKGN1ciAmJiBjdXIudGFnTmFtZSAmJiBob3BzIDwgMjApeyB2" +
  "YXIgdGFnID0gY3VyLnRhZ05hbWUudG9Mb3dlckNhc2UoKTsgaWYgKHRhZyA9PT0gJ2Zvb3RlcicgfHwgdGFnID09PSAnbmF2Jykg" +
  "cmV0dXJuIHRydWU7IHZhciBjbHMgPSAoY3VyLmNsYXNzTmFtZSAmJiBjdXIuY2xhc3NOYW1lLnRvU3RyaW5nKSA/IGN1ci5jbGFz" +
  "c05hbWUudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpIDogJyc7IHZhciBpZEF0dHIgPSAoY3VyLmlkIHx8ICcnKS50b0xvd2VyQ2Fz" +
  "ZSgpOyB2YXIgcm9sZSA9IGN1ci5nZXRBdHRyaWJ1dGUgPyAoY3VyLmdldEF0dHJpYnV0ZSgncm9sZScpIHx8ICcnKSA6ICcnOyBp" +
  "ZiAocm9sZSA9PT0gJ25hdmlnYXRpb24nKSByZXR1cm4gdHJ1ZTsgZm9yICh2YXIgdz0wOyB3PGJsb2NrZWRXb3Jkcy5sZW5ndGg7" +
  "IHcrKyl7IGlmIChjbHMuaW5kZXhPZihibG9ja2VkV29yZHNbd10pICE9PSAtMSB8fCBpZEF0dHIuaW5kZXhPZihibG9ja2VkV29y" +
  "ZHNbd10pICE9PSAtMSkgcmV0dXJuIHRydWU7IH0gaWYgKHRhZyA9PT0gJ2JvZHknIHx8IHRhZyA9PT0gJ2h0bWwnKSBicmVhazsg" +
  "Y3VyID0gY3VyLnBhcmVudEVsZW1lbnQ7IGhvcHMrKzsgfSByZXR1cm4gZmFsc2U7IH0gIGZ1bmN0aW9uIGNsaWNrRXhwYW5kVG9n" +
  "Z2xlcyh3aW5kb3dUZXh0KXsgdmFyIHBocmFzZXMgPSBbJ3ZvaXIgcGx1cycsJ2xpcmUgbGEgc3VpdGUnLCdhZmZpY2hlciBwbHVz" +
  "JywnZW4gc2F2b2lyIHBsdXMnLCdzaG93IG1vcmUnLCdyZWFkIG1vcmUnLCdkZXZlbG9wcGVyJywndm9pciBsYSBzdWl0ZSddOyB2" +
  "YXIgZGVueWxpc3QgPSBbJ29mZnJlcycsJ3Bob3RvcycsJ2ltYWdlcycsJ3NpbWlsYWlyZXMnLCdyZWNoZXJjaGVzJywnYXJ0aWNs" +
  "ZXMnXTsgdmFyIG5vZGVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnYnV0dG9uLCBhLCBzcGFuLCBkaXYsIFtyb2xlPWJ1" +
  "dHRvbl0nKTsgdmFyIGNsaWNrZWQgPSAwOyB2YXIgbG93ZXJXaW5kb3cgPSBzdHJpcEFjY2VudHMod2luZG93VGV4dC50b0xvd2Vy" +
  "Q2FzZSgpKTsgZm9yICh2YXIgaT0wO2k8bm9kZXMubGVuZ3RoO2krKyl7IHZhciBlbCA9IG5vZGVzW2ldOyB2YXIgcmF3VHh0ID0g" +
  "KGVsLmlubmVyVGV4dCB8fCBlbC50ZXh0Q29udGVudCB8fCAnJykudHJpbSgpOyB2YXIgdHh0ID0gc3RyaXBBY2NlbnRzKHJhd1R4" +
  "dC50b0xvd2VyQ2FzZSgpKTsgaWYgKCF0eHQgfHwgdHh0Lmxlbmd0aCA+IDYwKSBjb250aW51ZTsgdmFyIGhhc0RlbmllZCA9IGZh" +
  "bHNlOyBmb3IgKHZhciBkPTA7ZDxkZW55bGlzdC5sZW5ndGg7ZCsrKXsgaWYgKHR4dC5pbmRleE9mKGRlbnlsaXN0W2RdKSAhPT0g" +
  "LTEpeyBoYXNEZW5pZWQgPSB0cnVlOyBicmVhazsgfSB9IGlmIChoYXNEZW5pZWQpIGNvbnRpbnVlOyB2YXIgaXNNYXRjaCA9IGZh" +
  "bHNlOyBmb3IgKHZhciBwPTA7cDxwaHJhc2VzLmxlbmd0aDtwKyspeyBpZiAodHh0LmluZGV4T2YocGhyYXNlc1twXSkgIT09IC0x" +
  "KXsgaXNNYXRjaCA9IHRydWU7IGJyZWFrOyB9IH0gaWYgKCFpc01hdGNoKSBjb250aW51ZTsgaWYgKGlzSW5FeGNsdWRlZFJlZ2lv" +
  "bihlbCkpIGNvbnRpbnVlOyBpZiAobG93ZXJXaW5kb3cuaW5kZXhPZih0eHQpID09PSAtMSkgY29udGludWU7IGlmIChlbC50YWdO" +
  "YW1lID09PSAnQScpeyB2YXIgaHJlZiA9IGVsLmdldEF0dHJpYnV0ZSgnaHJlZicpOyBpZiAoaHJlZiAmJiBocmVmICE9PSAnIycg" +
  "JiYgaHJlZi5pbmRleE9mKCdqYXZhc2NyaXB0OicpICE9PSAwKSBjb250aW51ZTsgfSB0cnkgeyBlbC5jbGljaygpOyBjbGlja2Vk" +
  "Kys7IH0gY2F0Y2goZSl7fSB9IHJldHVybiBjbGlja2VkOyB9ICBmdW5jdGlvbiBleHRyYWN0Sm9iVGV4dChmdWxsVGV4dCl7IHZh" +
  "ciBib3VuZHMgPSBjb21wdXRlQ29udGVudEJvdW5kcyhmdWxsVGV4dCk7IHZhciByZXN1bHQgPSBmdWxsVGV4dC5zbGljZShib3Vu" +
  "ZHMuc3RhcnQsIGJvdW5kcy5lbmQpOyByZXR1cm4gcmVzdWx0LnRyaW0oKS5sZW5ndGggPiAyMDAgPyByZXN1bHQgOiBmdWxsVGV4" +
  "dDsgfSBmdW5jdGlvbiBkaXJlY3RUZXh0KGVsKXsgdmFyIHR4dCA9ICcnOyBmb3IgKHZhciBpPTA7aTxlbC5jaGlsZE5vZGVzLmxl" +
  "bmd0aDtpKyspeyB2YXIgbm9kZSA9IGVsLmNoaWxkTm9kZXNbaV07IGlmIChub2RlLm5vZGVUeXBlID09PSAzKSB0eHQgKz0gbm9k" +
  "ZS50ZXh0Q29udGVudDsgfSByZXR1cm4gdHh0LnJlcGxhY2UoL1xzKy9nLCcgJykudHJpbSgpOyB9IGZ1bmN0aW9uIHN0cmlwU2l0" +
  "ZUJyYW5kU3VmZml4KHJhd1RpdGxlKXsgdmFyIGJyYW5kcyA9IFsnaGVsbG93b3JrJywnbGlua2VkaW4nLCdpbmRlZWQnLCd3ZWxj" +
  "b21lIHRvIHRoZSBqdW5nbGUnLCd3dHRqJywnYXBlYycsJ3BvbGUgZW1wbG9pJywnZnJhbmNlIHRyYXZhaWwnLCdtb25zdGVyJywn" +
  "Z2xhc3Nkb29yJywna2Vsam9iJywncmVnaW9uc2pvYicsJ2NhZHJlbXBsb2knXTsgdmFyIHNlcHMgPSBbJyB8ICcsICcgLSAnLCAn" +
  "XHUyMDE0J107IHZhciBjbGVhbmVkID0gcmF3VGl0bGU7IGZvciAodmFyIGk9MDtpPHNlcHMubGVuZ3RoO2krKyl7IHZhciBpZHgg" +
  "PSBjbGVhbmVkLmxhc3RJbmRleE9mKHNlcHNbaV0pOyBpZiAoaWR4ID09PSAtMSkgY29udGludWU7IHZhciB0YWlsID0gY2xlYW5l" +
  "ZC5zbGljZShpZHggKyBzZXBzW2ldLmxlbmd0aCkudG9Mb3dlckNhc2UoKTsgdmFyIGlzQnJhbmQgPSBmYWxzZTsgZm9yICh2YXIg" +
  "Yj0wO2I8YnJhbmRzLmxlbmd0aDtiKyspeyBpZiAodGFpbC5pbmRleE9mKGJyYW5kc1tiXSkgIT09IC0xKXsgaXNCcmFuZCA9IHRy" +
  "dWU7IGJyZWFrOyB9IH0gaWYgKGlzQnJhbmQpeyBjbGVhbmVkID0gY2xlYW5lZC5zbGljZSgwLCBpZHgpLnRyaW0oKTsgYnJlYWs7" +
  "IH0gfSByZXR1cm4gY2xlYW5lZDsgfSBmdW5jdGlvbiBleHRyYWN0Q29tcGFueUZyb21UaXRsZShyYXdUaXRsZSl7IHZhciBjbGVh" +
  "bmVkID0gc3RyaXBTaXRlQnJhbmRTdWZmaXgocmF3VGl0bGUpOyB2YXIgbSA9IGNsZWFuZWQubWF0Y2goLyg/OnJlY3J1dGVtZW50" +
  "IHBhcnxjaGV6fHBhcilccysoLispJC9pKTsgaWYgKG0gJiYgbVsxXSAmJiBtWzFdLnRyaW0oKS5sZW5ndGggPiAxICYmIG1bMV0u" +
  "dHJpbSgpLmxlbmd0aCA8IDYwKSByZXR1cm4gbVsxXS50cmltKCk7IHJldHVybiAnJzsgfSAgZnVuY3Rpb24gZ2V0Sm9iUG9zdGlu" +
  "Z0pzb25MZCgpeyB0cnkgeyB2YXIgc2NyaXB0cyA9IFtdOyB2YXIgYWxsU2NyaXB0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlU" +
  "YWdOYW1lKCdzY3JpcHQnKTsgZm9yICh2YXIgcz0wOyBzPGFsbFNjcmlwdHMubGVuZ3RoOyBzKyspeyB2YXIgdHlwZUF0dHIgPSAo" +
  "YWxsU2NyaXB0c1tzXS5nZXRBdHRyaWJ1dGUoJ3R5cGUnKSB8fCAnJykudG9Mb3dlckNhc2UoKTsgaWYgKHR5cGVBdHRyLmluZGV4" +
  "T2YoJ2xkK2pzb24nKSAhPT0gLTEpIHNjcmlwdHMucHVzaChhbGxTY3JpcHRzW3NdKTsgfSBmb3IgKHZhciBpPTA7aTxzY3JpcHRz" +
  "Lmxlbmd0aDtpKyspeyB0cnkgeyB2YXIgZGF0YSA9IEpTT04ucGFyc2Uoc2NyaXB0c1tpXS50ZXh0Q29udGVudCk7IHZhciBjYW5k" +
  "aWRhdGVzID0gQXJyYXkuaXNBcnJheShkYXRhKSA/IGRhdGEgOiBbZGF0YV07IGZvciAodmFyIGo9MDtqPGNhbmRpZGF0ZXMubGVu" +
  "Z3RoO2orKyl7IHZhciBpdGVtID0gY2FuZGlkYXRlc1tqXTsgaWYgKCFpdGVtKSBjb250aW51ZTsgdmFyIGl0ZW1UeXBlID0gaXRl" +
  "bVsnQHR5cGUnXTsgdmFyIGlzSm9iUG9zdGluZyA9IGl0ZW1UeXBlID09PSAnSm9iUG9zdGluZycgfHwgKEFycmF5LmlzQXJyYXko" +
  "aXRlbVR5cGUpICYmIGl0ZW1UeXBlLmluZGV4T2YoJ0pvYlBvc3RpbmcnKSAhPT0gLTEpOyBpZiAoaXNKb2JQb3N0aW5nKSByZXR1" +
  "cm4gaXRlbTsgaWYgKGl0ZW1bJ0BncmFwaCddICYmIEFycmF5LmlzQXJyYXkoaXRlbVsnQGdyYXBoJ10pKXsgZm9yICh2YXIgaz0w" +
  "O2s8aXRlbVsnQGdyYXBoJ10ubGVuZ3RoO2srKyl7IHZhciBnID0gaXRlbVsnQGdyYXBoJ11ba107IGlmIChnICYmIGdbJ0B0eXBl" +
  "J10gPT09ICdKb2JQb3N0aW5nJykgcmV0dXJuIGc7IH0gfSB9IH0gY2F0Y2goZSl7fSB9IH0gY2F0Y2goZSl7fSByZXR1cm4gbnVs" +
  "bDsgfSAgZnVuY3Rpb24gaXNKdW5rSGVhZGluZyh0eHQpeyB2YXIganVuayA9IFsnbm90aWZpY2F0aW9uJywnYmllbnZlbnVlJywn" +
  "bWVudScsJ2FjY3VlaWwnLCdyZWNoZXJjaGUnLCdwYW5pZXInLCdzZSBjb25uZWN0ZXInLCdjb25uZXhpb24nLCdtb24gY29tcHRl" +
  "JywnZGVjb25uZXhpb24nLCdwYXJhbWV0cmVzJywnbmF2aWdhdGlvbicsJ2VtcGxvaXMgc3VnZ2VyZXMnLCdvZmZyZXMgc3VnZ2Vy" +
  "ZWVzJywncG9zdGVzIHN1Z2dlcmVzJywnc3VnZ2VzdGVkIGpvYicsJ3NpbWlsYXIgam9iJywnb2ZmcmVzIHNpbWlsYWlyZXMnLCdy" +
  "ZWNvbW1hbmRlIHBvdXIgdm91cycsJ3JlY29tbWFuZGF0aW9ucyddOyB2YXIgbG93ID0gc3RyaXBBY2NlbnRzKHR4dC50b0xvd2Vy" +
  "Q2FzZSgpKTsgZm9yICh2YXIgano9MDsgano8anVuay5sZW5ndGg7IGp6KyspeyBpZiAobG93LmluZGV4T2YoanVua1tqel0pICE9" +
  "PSAtMSkgcmV0dXJuIHRydWU7IH0gcmV0dXJuIGZhbHNlOyB9IHZhciBoZWFkaW5nQ2FuZGlkYXRlcyA9IGRvY3VtZW50LnF1ZXJ5" +
  "U2VsZWN0b3JBbGwoJ2gxLCBoMiwgW3JvbGU9aGVhZGluZ10nKTsgdmFyIGgxVGV4dCA9ICcnOyBmb3IgKHZhciBoYz0wOyBoYzxo" +
  "ZWFkaW5nQ2FuZGlkYXRlcy5sZW5ndGg7IGhjKyspeyB2YXIgY2FuZCA9IGhlYWRpbmdDYW5kaWRhdGVzW2hjXTsgdmFyIGR0ID0g" +
  "ZGlyZWN0VGV4dChjYW5kKTsgdmFyIGNhbmRUZXh0ID0gKGR0Lmxlbmd0aCA+IDIgJiYgZHQubGVuZ3RoIDwgMTIwKSA/IGR0IDog" +
  "KGNhbmQuaW5uZXJUZXh0IHx8ICcnKS50cmltKCkuc2xpY2UoMCwxMjApOyBpZiAoY2FuZFRleHQgJiYgIWlzSnVua0hlYWRpbmco" +
  "Y2FuZFRleHQpKXsgaDFUZXh0ID0gY2FuZFRleHQ7IGJyZWFrOyB9IH0gaWYgKCFoMVRleHQpeyBoMVRleHQgPSBzdHJpcFNpdGVC" +
  "cmFuZFN1ZmZpeCgoZG9jdW1lbnQudGl0bGUgfHwgJycpLnRyaW0oKSkuc2xpY2UoMCwxMjApOyB9ICB2YXIgdG90YWxDbGlja3Mg" +
  "PSAwOyBmb3IgKHZhciBwYXNzPTA7IHBhc3M8MjsgcGFzcysrKXsgdmFyIHJhd05vdyA9IGRvY3VtZW50LmJvZHkgPyBkb2N1bWVu" +
  "dC5ib2R5LmlubmVyVGV4dCA6ICcnOyB2YXIgd2luID0gY29tcHV0ZUNsaWNrV2luZG93KHJhd05vdywgaDFUZXh0KTsgdmFyIHdp" +
  "bmRvd1RleHQgPSByYXdOb3cuc2xpY2Uod2luLnN0YXJ0LCB3aW4uZW5kKTsgdmFyIG4gPSBjbGlja0V4cGFuZFRvZ2dsZXMod2lu" +
  "ZG93VGV4dCk7IHRvdGFsQ2xpY2tzICs9IG47IGlmIChuID09PSAwKSBicmVhazsgYXdhaXQgbmV3IFByb21pc2UoZnVuY3Rpb24o" +
  "cmVzKXsgc2V0VGltZW91dChyZXMsIDQwMCk7IH0pOyB9ICB2YXIgdCA9IGRvY3VtZW50LnRpdGxlIHx8ICcnOyB2YXIgcmF3ID0g" +
  "ZG9jdW1lbnQuYm9keSA/IGRvY3VtZW50LmJvZHkuaW5uZXJUZXh0IDogJyc7IHZhciBjbGVhbmVkID0gZXh0cmFjdEpvYlRleHQo" +
  "cmF3KTsgdmFyIHggPSBjbGVhbmVkLnJlcGxhY2UoL1xzKy9nLCcgJykudHJpbSgpOyB2YXIgbXggPSA2MDAwOyBpZiAoeC5sZW5n" +
  "dGg+bXgpIHggPSB4LnNsaWNlKDAsbXgpOyB2YXIgdSA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmOyB2YXIganNvbkxkID0gZ2V0Sm9i" +
  "UG9zdGluZ0pzb25MZCgpOyB2YXIgcm9sZUZyb21MZCA9IChqc29uTGQgJiYganNvbkxkLnRpdGxlKSA/IFN0cmluZyhqc29uTGQu" +
  "dGl0bGUpLnRyaW0oKS5zbGljZSgwLDEyMCkgOiAnJzsgdmFyIGNvbXBhbnlGcm9tTGQgPSAoanNvbkxkICYmIGpzb25MZC5oaXJp" +
  "bmdPcmdhbml6YXRpb24gJiYganNvbkxkLmhpcmluZ09yZ2FuaXphdGlvbi5uYW1lKSA/IFN0cmluZyhqc29uTGQuaGlyaW5nT3Jn" +
  "YW5pemF0aW9uLm5hbWUpLnRyaW0oKS5zbGljZSgwLDEyMCkgOiAnJzsgdmFyIHIgPSByb2xlRnJvbUxkIHx8IGgxVGV4dDsgdmFy" +
  "IGMgPSBjb21wYW55RnJvbUxkIHx8IGV4dHJhY3RDb21wYW55RnJvbVRpdGxlKHQpOyB2YXIgYmFzZT0naHR0cHM6Ly9hdHRpdHVk" +
  "ZS1hbHRlcm5hbmNlLmZyL2Rhc2hib2FyZC9hcHBsaWNhdGlvbnMnOyB2YXIgcT1uZXcgVVJMU2VhcmNoUGFyYW1zKCk7IGlmKGMp" +
  "cS5zZXQoJ3ByZWZpbGxDb21wYW55JyxjKTsgaWYocilxLnNldCgncHJlZmlsbFJvbGUnLHIpOyBxLnNldCgncHJlZmlsbFVybCcs" +
  "dSk7IHEuc2V0KCdwcmVmaWxsRGVzY3JpcHRpb24nLHgpOyB3aW5kb3cub3BlbihiYXNlKyc/JytxLnRvU3RyaW5nKCksJ19ibGFu" +
  "aycpOyB9KSgpOw==";

function decodeBase64(b64) {
  if (typeof atob === "function") return atob(b64);
  return Buffer.from(b64, "base64").toString("binary");
}

const BOOKMARKLET_CODE = decodeBase64(BOOKMARKLET_CODE_B64);
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
          HelloWork, Welcome to the Jungle...), un clic ouvre directement la fen&ecirc;tre d&apos;ajout de candidature,
          d&eacute;j&agrave; remplie autant que possible.
        </p>

        <div className="mt-5 rounded-2xl border border-dashed border-primary-200 bg-primary-50 p-6 text-center">
          <p className="mb-3 text-sm font-medium text-primary-600">&#8595; Glisse ce bouton dans ta barre de favoris &#8595;</p>
          <a
            href={BOOKMARKLET_HREF}
            onClick={(e) => e.preventDefault()}
            className="inline-flex cursor-grab select-none items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-pop active:cursor-grabbing"
          >
            + Ajouter &agrave; Attitude Alternance
          </a>
          <p className="mt-3 text-xs text-primary-500/80">
            Tu ne vois pas ta barre de favoris ? Fais Ctrl+Maj+B (Windows) ou Cmd+Maj+B (Mac) pour l&apos;afficher,
            puis reviens ici.
          </p>
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium text-ink">Le glisser-d&eacute;poser ne fonctionne pas ? Installe-le &agrave; la main :</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-ink/80">
            <li>Clic droit sur ta barre de favoris &#8594; &laquo; Ajouter une page &raquo;.</li>
            <li>Donne-lui le nom que tu veux, par exemple &laquo; Ajouter &agrave; Attitude Alternance &raquo;.</li>
            <li>Copie le lien ci-dessous et colle-le dans le champ URL, puis valide.</li>
          </ol>
          <div className="mt-3 flex items-start gap-2">
            <code className="max-h-24 flex-1 overflow-y-auto break-all rounded-lg bg-paper/60 p-3 text-xs text-ink/60">
              {BOOKMARKLET_HREF}
            </code>
            <Button type="button" size="sm" variant="secondary" onClick={handleCopyLink}>
              {copied ? "Copi\u00e9 \u2713" : "Copier"}
            </Button>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-warn-50 p-4 text-xs text-warn">
          &#9888; Fonctionne uniquement sur ordinateur (pas sur mobile). &Ccedil;a marche bien sur la plupart des sites
          d&apos;offres, mais pas &agrave; 100% selon leur mise en page : v&eacute;rifie et compl&egrave;te les champs si besoin avant
          de valider &mdash; mieux vaut un champ vide &agrave; corriger qu&apos;une information fausse.
        </div>
      </Card>

      <Card>
        <h2 className="font-display text-base font-semibold text-ink">Comment &ccedil;a marche</h2>
        <ol className="mt-3 space-y-2.5 text-sm text-ink/80">
          <li><span className="font-semibold text-primary">1.</span> Installe le bouton une seule fois (ci-contre).</li>
          <li><span className="font-semibold text-primary">2.</span> Va sur une offre qui t&apos;int&eacute;resse (LinkedIn, Indeed, HelloWork...).</li>
          <li><span className="font-semibold text-primary">3.</span> Clique sur le favori install&eacute; dans ta barre.</li>
          <li><span className="font-semibold text-primary">4.</span> La fen&ecirc;tre &laquo; Ajouter une candidature &raquo; s&apos;ouvre, d&eacute;j&agrave; remplie.</li>
          <li><span className="font-semibold text-primary">5.</span> V&eacute;rifie, compl&egrave;te si besoin, et valide.</li>
        </ol>
      </Card>
    </div>
  );
}
