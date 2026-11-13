// Mails à part : accueil épinglé, Secret Santa, invitation qui fuit, invitations volantes,
// mails rares et contenu des autres dossiers. Même format que mails-a.js / mails-b.js.

window.DL_WELCOME = {
  id: 'dl-bienvenue',
  fam: 'downlook',
  from: ['Service informatique'],
  email: 'service-informatique',
  subject: 'Incident en cours : messagerie indisponible',
  body: `Bonjour,

Depuis jeudi 17 h 17, la messagerie est indisponible. Nos équipes sont pleinement mobilisées.

En attendant, vos mails continuent d'arriver ici. Rien ne vous oblige à les lire. Rien ne vous y obligeait avant non plus.

Cordialement,
Le service informatique

PS : ce message vous a été envoyé par mail.`,
  pinned: true,
};

// Invitations volantes : elles se posent quelques secondes, puis repartent.
window.DL_FLYING = [
  { subject: 'Débrief du point de synchro', duration: '45 min', people: [8, 16] },
  { subject: 'Point de cadrage du cadrage', duration: '1 h 30', people: [9, 18] },
  { subject: 'Point d\'avancement sur les points d\'avancement', duration: '1 h', people: [5, 9] },
  { subject: 'Comité de pilotage du comité de pilotage', duration: '2 h', people: [14, 26] },
  { subject: 'Visio de suivi vendredi 17 h 30 (caméra obligatoire)', duration: '1 h', people: [6, 15] },
  { subject: 'Brainstorming : comment mieux communiquer par mail', duration: '1 h 30', people: [11, 24] },
];
window.DL_FATES = [
  'Échec de la remise',
  'Partie aux oubliettes',
  'Égarée entre deux datacenters',
  'Remise reportée à 2037',
  'Repartie d\'où elle venait',
  'Absorbée par la file d\'attente',
];

// Mails rares en complément de ceux du lot B.
window.DL_RARES = [
  {
    id: 'rare-n1-pars-tot',
    fam: 'rare',
    from: ['Votre N+1'],
    subject: 'Pars plus tôt ce soir',
    body: `Hello,

Sans mails ni réunions, je ne vois pas bien ce que je pourrais te demander aujourd'hui.

Pars plus tôt, profite. On se voit lundi.`,
    tag: 'Ce mail n\'existe dans aucune entreprise connue. Il a été vu une seule fois, en 2014.',
  },
  {
    id: 'rare-statut-absent',
    fam: 'rare',
    from: ['Notifications de présence'],
    email: 'presence',
    subject: 'Votre statut est passé à "Absent"',
    body: `Votre statut est passé à "Absent" jeudi à 17 h 17.

Pour la première fois, il dit la vérité.`,
  },
  {
    id: 'rare-stagiaire-script',
    fam: 'rare',
    from: ['Stagiaire {projet}'],
    subject: 'J\'ai peut-être une piste pour la panne',
    body: `Bonjour,

Jeudi vers 17 h 15, j'ai lancé un petit script qui fait "Répondre à tous" sur chaque mail de la boîte, pour tester.

Il tourne encore. C'est grave ?`,
  },
  {
    id: 'rare-mail-2009',
    fam: 'rare',
    from: ['Vous (2009)'],
    email: 'vous-en-2009',
    subject: 'TR: TR: TR: TR: Ce diaporama va vous faire rire !!!',
    body: `Ce message attendait dans la file d'attente depuis mars 2009. La panne l'a débloqué.

Regardez jusqu'au bout, la fin est trop drôle !!! Et transférez à 10 personnes sinon pas de chance pendant 7 ans.`,
    att: ['chatons_musique_classique.pps (24 Mo)'],
  },
];

// Réponses courtes pour les rafales de "Répondre à tous".
window.DL_REPLYALL_ECHOES = [
  'Moi aussi, merci.',
  '+1',
  'Merci de me retirer également de cette liste.',
  'Merci d\'arrêter de répondre à tous.',
  'Pareil.',
  'Je ne suis pas concerné non plus, merci.',
  'Quelqu\'un sait comment on se retire de la liste ?',
  'Je mets mon N+1 en copie pour info.',
  'Merci de ne PAS répondre à tous.',
  'Idem.',
  'Je suis en congé, merci de ne plus m\'écrire.',
  'Qui a lancé ça ?',
  'Je confirme ne pas être concerné.',
  'Désinscription, svp.',
  'Message reçu. Enfin, il aurait dû.',
];
window.DL_ECHO_SENDERS = [
  'Contrôle de gestion', 'Équipe Data', 'Service juridique', 'Agence de Lyon', 'Support N2', 'Équipe QA',
  'Direction financière', 'Équipe mobile', 'Agence de Nantes', 'Paie et administration', 'Équipe Front',
  'Bureau d\'études', 'Équipe Infra', 'Service client', 'Marketing digital', 'Agence de Lille', 'Achats',
  'Équipe Back', 'Communication interne', 'Équipe Design', 'Accueil du site de Bordeaux',
];

// Contenu des autres dossiers.
window.DL_FOLDERS = {
  inbox: { empty: 'Votre boîte de réception est vide.', sub: 'Profitez-en, c\'est la première fois depuis votre embauche.' },
  sent: { empty: 'Rien n\'est parti depuis jeudi 17 h 17.', sub: 'Pour une fois, ce n\'est pas vous qui ne répondez pas.' },
  archive: { empty: 'Le mail le plus récent de l\'archive date de jeudi 17 h 16.', sub: 'Il disait "on en reparle demain".' },
  drafts: [
    {
      id: 'brouillon-demission',
      fam: 'brouillon',
      from: ['Vous'],
      email: 'vous',
      subject: 'Lettre de démission (v14)',
      body: `Madame, Monsieur,

Après mûre réflexion, 394 "Répondre à tous" et un 45e "petit point rapide" cette semaine, j'ai l'honneur de vous informer que j'ai trouvé une offre bien plus adaptée à mes compétences sur Les Joies du Code : [lesjoiesducode.fr/jobs](https://lesjoiesducode.fr/jobs)

Je reste disponible pour un dernier petit point rapide.

Cordialement,
Vous

PS : les versions 1 à 13 sont toujours dans mes brouillons.`,
    },
  ],
  outbox: [
    {
      id: 'envoi-outlook-marche-pas',
      fam: 'envoi',
      from: ['Vous'],
      email: 'vous',
      subject: 'Mon Outlook marche pas',
      body: `Bonjour,

Mes mails ne partent plus depuis jeudi. Vous pouvez regarder ?

Merci de me répondre par mail.`,
      tag: 'En attente dans la boîte d\'envoi depuis jeudi 17 h 19.',
    },
    {
      id: 'envoi-ok-pour-moi',
      fam: 'envoi',
      from: ['Vous'],
      email: 'vous',
      subject: 'RE: Petit point rapide ?',
      body: `Ok pour moi, mais 5 minutes alors.`,
      tag: 'Heureusement pour vous, ce mail n\'est jamais parti.',
    },
  ],
  junk: [
    {
      id: 'spam-millionieme',
      fam: 'spam',
      from: ['Intranet'],
      subject: 'Félicitations, vous êtes le 1 000 000e visiteur de l\'intranet !',
      body: `Vous remportez un mug à l'effigie du nouveau logo de l'intranet.

À retirer à l'accueil du bâtiment C, entre 12 h 10 et 12 h 15.`,
    },
    {
      id: 'spam-webinaire-ia',
      fam: 'spam',
      from: ['Événements Tech'],
      subject: 'Webinaire : l\'IA va-t-elle remplacer les webinaires ?',
      body: `Rejoignez-nous jeudi pour 3 h de réponse à cette question.

Intervenants : une IA, deux consultants et un modérateur qui partira à la pause.`,
    },
    {
      id: 'spam-newsletter',
      fam: 'spam',
      from: ['Communication interne'],
      subject: 'Votre abonnement à la newsletter interne est renouvelé',
      body: `Bonne nouvelle : votre abonnement à la newsletter interne a été renouvelé pour 10 ans.

Pour vous désabonner, merci d'envoyer un courrier papier au siège.`,
    },
    {
      id: 'spam-excel',
      fam: 'spam',
      from: ['Catalogue formation'],
      subject: 'Formation : maîtriser Excel en 3 jours (niveau 4)',
      body: `Prérequis : maîtriser Excel.

Au programme : RECHERCHEV, fusion de cellules, et comment survivre à la macro de 2011 dont personne n'a les sources.`,
    },
  ],
  deleted: [
    {
      id: 'suppr-signature',
      fam: 'supprime',
      from: ['Vous'],
      email: 'vous',
      subject: 'Ma signature de mail (v12, avec le logo animé)',
      body: `Cordialement,
Votre nom
Votre poste
Votre logo animé en GIF de 2 Mo
"Pensez à l'environnement avant d'imprimer ce mail."`,
      tag: 'Supprimé. Vous avez bien fait.',
    },
    {
      id: 'suppr-reunion-8h',
      fam: 'supprime',
      from: ['Agenda'],
      subject: 'Rappel : réunion à 8 h demain',
      body: `Vous avez supprimé ce rappel sans l'ouvrir.

Excellent réflexe.`,
    },
  ],
};
