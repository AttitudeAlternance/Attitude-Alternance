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
  "Y3VyID0gY3VyLnBhcmVudEVsZW1lbnQ7IGhvcHMrKzsgfSByZXR1cm4gZmFsc2U7IH0gIGZ1bmN0aW9uIGdldEZpbHRlcmVkQm9k" +
  "eVRleHQoKXsgdmFyIHRvUmVzdG9yZSA9IFtdOyB0cnkgeyB2YXIgc2VsID0gIltjbGFzcyo9J2Nvb2tpZScgaV0sIFtpZCo9J2Nv" +
  "b2tpZScgaV0sIFtjbGFzcyo9J2NvbnNlbnQnIGldLCBbaWQqPSdjb25zZW50JyBpXSwgW2NsYXNzKj0ndGFydGVhdWNpdHJvbicg" +
  "aV0sIFtpZCo9J3RhcnRlYXVjaXRyb24nIGldLCBbY2xhc3MqPSdvbmV0cnVzdCcgaV0sIFtpZCo9J29uZXRydXN0JyBpXSwgW2Ns" +
  "YXNzKj0nZGlkb21pJyBpXSwgW2lkKj0nZGlkb21pJyBpXSwgW2NsYXNzKj0nYXhlcHRpbycgaV0sIFtpZCo9J2F4ZXB0aW8nIGld" +
  "LCBbY2xhc3MqPSdjb29raWVib3QnIGldLCBbaWQqPSdjb29raWVib3QnIGldLCBbY2xhc3MqPSdnZHByJyBpXSwgW2lkKj0nZ2Rw" +
  "cicgaV0sIFtjbGFzcyo9J3JncGQnIGldLCBbaWQqPSdyZ3BkJyBpXSwgZm9vdGVyLCBuYXYiOyB2YXIgbm9kZXMgPSBkb2N1bWVu" +
  "dC5xdWVyeVNlbGVjdG9yQWxsKHNlbCk7IGZvciAodmFyIGk9MDtpPG5vZGVzLmxlbmd0aDtpKyspeyB2YXIgZWwgPSBub2Rlc1tp" +
  "XTsgaWYgKGVsICYmIGVsLnN0eWxlICYmIGVsLnN0eWxlLmRpc3BsYXkgIT09ICdub25lJyl7IHRvUmVzdG9yZS5wdXNoKHsgZWw6" +
  "IGVsLCBwcmV2OiBlbC5zdHlsZS5kaXNwbGF5IH0pOyBlbC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnOyB9IH0gfSBjYXRjaChlKXt9" +
  "IHZhciB0eHQgPSBkb2N1bWVudC5ib2R5ID8gZG9jdW1lbnQuYm9keS5pbm5lclRleHQgOiAnJzsgZm9yICh2YXIgaj0wO2o8dG9S" +
  "ZXN0b3JlLmxlbmd0aDtqKyspeyB0cnkgeyB0b1Jlc3RvcmVbal0uZWwuc3R5bGUuZGlzcGxheSA9IHRvUmVzdG9yZVtqXS5wcmV2" +
  "OyB9IGNhdGNoKGUpe30gfSByZXR1cm4gdHh0OyB9ICBmdW5jdGlvbiBjbGlja0V4cGFuZFRvZ2dsZXMod2luZG93VGV4dCl7IHZh" +
  "ciBwaHJhc2VzID0gWyd2b2lyIHBsdXMnLCdsaXJlIGxhIHN1aXRlJywnYWZmaWNoZXIgcGx1cycsJ2VuIHNhdm9pciBwbHVzJywn" +
  "c2hvdyBtb3JlJywncmVhZCBtb3JlJywnZGV2ZWxvcHBlcicsJ3ZvaXIgbGEgc3VpdGUnXTsgdmFyIGRlbnlsaXN0ID0gWydvZmZy" +
  "ZXMnLCdwaG90b3MnLCdpbWFnZXMnLCdzaW1pbGFpcmVzJywncmVjaGVyY2hlcycsJ2FydGljbGVzJ107IHZhciBub2RlcyA9IGRv" +
  "Y3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2J1dHRvbiwgYSwgc3BhbiwgZGl2LCBbcm9sZT1idXR0b25dJyk7IHZhciBjbGlja2Vk" +
  "ID0gMDsgdmFyIGxvd2VyV2luZG93ID0gc3RyaXBBY2NlbnRzKHdpbmRvd1RleHQudG9Mb3dlckNhc2UoKSk7IGZvciAodmFyIGk9" +
  "MDtpPG5vZGVzLmxlbmd0aDtpKyspeyB2YXIgZWwgPSBub2Rlc1tpXTsgdmFyIHJhd1R4dCA9IChlbC5pbm5lclRleHQgfHwgZWwu" +
  "dGV4dENvbnRlbnQgfHwgJycpLnRyaW0oKTsgdmFyIHR4dCA9IHN0cmlwQWNjZW50cyhyYXdUeHQudG9Mb3dlckNhc2UoKSk7IGlm" +
  "ICghdHh0IHx8IHR4dC5sZW5ndGggPiA2MCkgY29udGludWU7IHZhciBoYXNEZW5pZWQgPSBmYWxzZTsgZm9yICh2YXIgZD0wO2Q8" +
  "ZGVueWxpc3QubGVuZ3RoO2QrKyl7IGlmICh0eHQuaW5kZXhPZihkZW55bGlzdFtkXSkgIT09IC0xKXsgaGFzRGVuaWVkID0gdHJ1" +
  "ZTsgYnJlYWs7IH0gfSBpZiAoaGFzRGVuaWVkKSBjb250aW51ZTsgdmFyIGlzTWF0Y2ggPSBmYWxzZTsgZm9yICh2YXIgcD0wO3A8" +
  "cGhyYXNlcy5sZW5ndGg7cCsrKXsgaWYgKHR4dC5pbmRleE9mKHBocmFzZXNbcF0pICE9PSAtMSl7IGlzTWF0Y2ggPSB0cnVlOyBi" +
  "cmVhazsgfSB9IGlmICghaXNNYXRjaCkgY29udGludWU7IGlmIChpc0luRXhjbHVkZWRSZWdpb24oZWwpKSBjb250aW51ZTsgaWYg" +
  "KGxvd2VyV2luZG93LmluZGV4T2YodHh0KSA9PT0gLTEpIGNvbnRpbnVlOyBpZiAoZWwudGFnTmFtZSA9PT0gJ0EnKXsgdmFyIGhy" +
  "ZWYgPSBlbC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTsgaWYgKGhyZWYgJiYgaHJlZiAhPT0gJyMnICYmIGhyZWYuaW5kZXhPZignamF2" +
  "YXNjcmlwdDonKSAhPT0gMCkgY29udGludWU7IH0gdHJ5IHsgZWwuY2xpY2soKTsgY2xpY2tlZCsrOyB9IGNhdGNoKGUpe30gfSBy" +
  "ZXR1cm4gY2xpY2tlZDsgfSAgZnVuY3Rpb24gZXh0cmFjdEpvYlRleHQoZnVsbFRleHQpeyB2YXIgYm91bmRzID0gY29tcHV0ZUNv" +
  "bnRlbnRCb3VuZHMoZnVsbFRleHQpOyB2YXIgcmVzdWx0ID0gZnVsbFRleHQuc2xpY2UoYm91bmRzLnN0YXJ0LCBib3VuZHMuZW5k" +
  "KTsgcmV0dXJuIHJlc3VsdC50cmltKCkubGVuZ3RoID4gMjAwID8gcmVzdWx0IDogZnVsbFRleHQ7IH0gZnVuY3Rpb24gZGlyZWN0" +
  "VGV4dChlbCl7IHZhciB0eHQgPSAnJzsgZm9yICh2YXIgaT0wO2k8ZWwuY2hpbGROb2Rlcy5sZW5ndGg7aSsrKXsgdmFyIG5vZGUg" +
  "PSBlbC5jaGlsZE5vZGVzW2ldOyBpZiAobm9kZS5ub2RlVHlwZSA9PT0gMykgdHh0ICs9IG5vZGUudGV4dENvbnRlbnQ7IH0gcmV0" +
  "dXJuIHR4dC5yZXBsYWNlKC9ccysvZywnICcpLnRyaW0oKTsgfSBmdW5jdGlvbiBzdHJpcFNpdGVCcmFuZFN1ZmZpeChyYXdUaXRs" +
  "ZSl7IHZhciBicmFuZHMgPSBbJ2hlbGxvd29yaycsJ2xpbmtlZGluJywnaW5kZWVkJywnd2VsY29tZSB0byB0aGUganVuZ2xlJywn" +
  "d3R0aicsJ2FwZWMnLCdwb2xlIGVtcGxvaScsJ2ZyYW5jZSB0cmF2YWlsJywnbW9uc3RlcicsJ2dsYXNzZG9vcicsJ2tlbGpvYics" +
  "J3JlZ2lvbnNqb2InLCdjYWRyZW1wbG9pJ107IHZhciBzZXBzID0gWycgfCAnLCAnIC0gJywgJ1x1MjAxNCddOyB2YXIgY2xlYW5l" +
  "ZCA9IHJhd1RpdGxlOyBmb3IgKHZhciBpPTA7aTxzZXBzLmxlbmd0aDtpKyspeyB2YXIgaWR4ID0gY2xlYW5lZC5sYXN0SW5kZXhP" +
  "ZihzZXBzW2ldKTsgaWYgKGlkeCA9PT0gLTEpIGNvbnRpbnVlOyB2YXIgdGFpbCA9IGNsZWFuZWQuc2xpY2UoaWR4ICsgc2Vwc1tp" +
  "XS5sZW5ndGgpLnRvTG93ZXJDYXNlKCk7IHZhciBpc0JyYW5kID0gZmFsc2U7IGZvciAodmFyIGI9MDtiPGJyYW5kcy5sZW5ndGg7" +
  "YisrKXsgaWYgKHRhaWwuaW5kZXhPZihicmFuZHNbYl0pICE9PSAtMSl7IGlzQnJhbmQgPSB0cnVlOyBicmVhazsgfSB9IGlmIChp" +
  "c0JyYW5kKXsgY2xlYW5lZCA9IGNsZWFuZWQuc2xpY2UoMCwgaWR4KS50cmltKCk7IGJyZWFrOyB9IH0gcmV0dXJuIGNsZWFuZWQ7" +
  "IH0gZnVuY3Rpb24gZXh0cmFjdENvbXBhbnlGcm9tVGl0bGUocmF3VGl0bGUpeyB2YXIgY2xlYW5lZCA9IHN0cmlwU2l0ZUJyYW5k" +
  "U3VmZml4KHJhd1RpdGxlKTsgdmFyIG0gPSBjbGVhbmVkLm1hdGNoKC8oPzpyZWNydXRlbWVudCBwYXJ8Y2hlenxwYXIpXHMrKC4r" +
  "KSQvaSk7IGlmIChtICYmIG1bMV0gJiYgbVsxXS50cmltKCkubGVuZ3RoID4gMSAmJiBtWzFdLnRyaW0oKS5sZW5ndGggPCA2MCkg" +
  "cmV0dXJuIG1bMV0udHJpbSgpOyByZXR1cm4gJyc7IH0gZnVuY3Rpb24gc3RyaXBPZmZlck51bWJlclByZWZpeCh0eHQpeyByZXR1" +
  "cm4gdHh0LnJlcGxhY2UoL15ccypvZmZyZVxzKm5bwrDCum9dP1xzKls6XC1dP1xzKlxkW1xkXHNdKlxzKlstOl0/XHMqL2ksICcn" +
  "KS50cmltKCk7IH0gZnVuY3Rpb24gaHRtbFRvVGV4dChodG1sKXsgdHJ5IHsgdmFyIGQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50" +
  "KCdkaXYnKTsgZC5pbm5lckhUTUwgPSBodG1sOyByZXR1cm4gKGQudGV4dENvbnRlbnQgfHwgZC5pbm5lclRleHQgfHwgJycpLnJl" +
  "cGxhY2UoL1xzKy9nLCcgJykudHJpbSgpOyB9IGNhdGNoKGUpeyByZXR1cm4gU3RyaW5nKGh0bWwpLnJlcGxhY2UoLzxbXj5dKz4v" +
  "ZywnICcpLnJlcGxhY2UoL1xzKy9nLCcgJykudHJpbSgpOyB9IH0gZnVuY3Rpb24gZXh0cmFjdENvbXBhbnlGcm9tQ29udGVudE5l" +
  "YXIoZnVsbFRleHQpeyB0cnkgeyB2YXIgbTIgPSBmdWxsVGV4dC5tYXRjaCgvKD86ZW50cmVwcmlzZXxlbXBsb3lldXIpXHMqWzpc" +
  "LV0/XHMqKFtBLVowLTnDgMOCw4TDicOIw4rDi8OOw4/DlMOWw5nDm8Ocw4ddW1x3QS3DvyYnLiwtXXsxLDYwfSkvKTsgaWYgKG0y" +
  "ICYmIG0yWzFdKXsgdmFyIHYgPSBtMlsxXS50cmltKCk7IGlmICh2Lmxlbmd0aCA+IDEgJiYgdi5sZW5ndGggPCA2MCAmJiAhaXNK" +
  "dW5rSGVhZGluZyh2KSkgcmV0dXJuIHY7IH0gfSBjYXRjaChlKXt9IHJldHVybiAnJzsgfSAgZnVuY3Rpb24gZ2V0Sm9iUG9zdGlu" +
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
  "ZGlyZWN0VGV4dChjYW5kKTsgdmFyIGNhbmRUZXh0UmF3ID0gKGR0Lmxlbmd0aCA+IDIgJiYgZHQubGVuZ3RoIDwgMTIwKSA/IGR0" +
  "IDogKGNhbmQuaW5uZXJUZXh0IHx8ICcnKS50cmltKCkuc2xpY2UoMCwxMjApOyB2YXIgY2FuZFRleHQgPSBzdHJpcE9mZmVyTnVt" +
  "YmVyUHJlZml4KGNhbmRUZXh0UmF3KTsgaWYgKGNhbmRUZXh0ICYmICFpc0p1bmtIZWFkaW5nKGNhbmRUZXh0KSl7IGgxVGV4dCA9" +
  "IGNhbmRUZXh0OyBicmVhazsgfSB9IGlmICghaDFUZXh0KXsgaDFUZXh0ID0gc3RyaXBPZmZlck51bWJlclByZWZpeChzdHJpcFNp" +
  "dGVCcmFuZFN1ZmZpeCgoZG9jdW1lbnQudGl0bGUgfHwgJycpLnRyaW0oKSkpLnNsaWNlKDAsMTIwKTsgfSAgdmFyIHRvdGFsQ2xp" +
  "Y2tzID0gMDsgZm9yICh2YXIgcGFzcz0wOyBwYXNzPDI7IHBhc3MrKyl7IHZhciByYXdOb3cgPSBnZXRGaWx0ZXJlZEJvZHlUZXh0" +
  "KCk7IHZhciB3aW4gPSBjb21wdXRlQ2xpY2tXaW5kb3cocmF3Tm93LCBoMVRleHQpOyB2YXIgd2luZG93VGV4dCA9IHJhd05vdy5z" +
  "bGljZSh3aW4uc3RhcnQsIHdpbi5lbmQpOyB2YXIgbiA9IGNsaWNrRXhwYW5kVG9nZ2xlcyh3aW5kb3dUZXh0KTsgdG90YWxDbGlj" +
  "a3MgKz0gbjsgaWYgKG4gPT09IDApIGJyZWFrOyBhd2FpdCBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXMpeyBzZXRUaW1lb3V0KHJl" +
  "cywgNDAwKTsgfSk7IH0gIHZhciB0ID0gZG9jdW1lbnQudGl0bGUgfHwgJyc7IHZhciByYXcgPSBnZXRGaWx0ZXJlZEJvZHlUZXh0" +
  "KCk7IHZhciBjbGVhbmVkID0gZXh0cmFjdEpvYlRleHQocmF3KTsgdmFyIHggPSBjbGVhbmVkLnJlcGxhY2UoL1xzKy9nLCcgJyku" +
  "dHJpbSgpOyB2YXIgdSA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmOyB2YXIganNvbkxkID0gZ2V0Sm9iUG9zdGluZ0pzb25MZCgpOyB2" +
  "YXIgcm9sZUZyb21MZCA9IChqc29uTGQgJiYganNvbkxkLnRpdGxlKSA/IFN0cmluZyhqc29uTGQudGl0bGUpLnRyaW0oKS5zbGlj" +
  "ZSgwLDEyMCkgOiAnJzsgdmFyIGNvbXBhbnlGcm9tTGQgPSAoanNvbkxkICYmIGpzb25MZC5oaXJpbmdPcmdhbml6YXRpb24gJiYg" +
  "anNvbkxkLmhpcmluZ09yZ2FuaXphdGlvbi5uYW1lKSA/IFN0cmluZyhqc29uTGQuaGlyaW5nT3JnYW5pemF0aW9uLm5hbWUpLnRy" +
  "aW0oKS5zbGljZSgwLDEyMCkgOiAnJzsgdmFyIGRlc2NGcm9tTGQgPSAoanNvbkxkICYmIGpzb25MZC5kZXNjcmlwdGlvbikgPyBo" +
  "dG1sVG9UZXh0KFN0cmluZyhqc29uTGQuZGVzY3JpcHRpb24pKSA6ICcnOyBpZiAoZGVzY0Zyb21MZCAmJiBkZXNjRnJvbUxkLmxl" +
  "bmd0aCA+IDgwICYmIHgubGVuZ3RoIDwgMjAwKSB4ID0gZGVzY0Zyb21MZDsgdmFyIG14ID0gNjAwMDsgaWYgKHgubGVuZ3RoPm14" +
  "KSB4ID0geC5zbGljZSgwLG14KTsgdmFyIHIgPSByb2xlRnJvbUxkIHx8IGgxVGV4dDsgdmFyIGMgPSBjb21wYW55RnJvbUxkIHx8" +
  "IGV4dHJhY3RDb21wYW55RnJvbVRpdGxlKHQpIHx8IGV4dHJhY3RDb21wYW55RnJvbUNvbnRlbnROZWFyKHgpOyB2YXIgYmFzZT0n" +
  "aHR0cHM6Ly9hdHRpdHVkZS1hbHRlcm5hbmNlLmZyL2Rhc2hib2FyZC9hcHBsaWNhdGlvbnMnOyB2YXIgcT1uZXcgVVJMU2VhcmNo" +
  "UGFyYW1zKCk7IGlmKGMpcS5zZXQoJ3ByZWZpbGxDb21wYW55JyxjKTsgaWYocilxLnNldCgncHJlZmlsbFJvbGUnLHIpOyBxLnNl" +
  "dCgncHJlZmlsbFVybCcsdSk7IHEuc2V0KCdwcmVmaWxsRGVzY3JpcHRpb24nLHgpOyB3aW5kb3cub3BlbihiYXNlKyc/JytxLnRv" +
  "U3RyaW5nKCksJ19ibGFuaycpOyB9KSgpOw==";
function decodeBase64(b64: string): string {
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
              {copied ? "Copié ✓" : "Copier"}
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
