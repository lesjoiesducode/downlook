// Mails qui partagent une offre d'emploi réelle (jobs.json), le site d'offres en entier,
// ou un vrai meme du site (memes.json). Les liens reçoivent les paramètres UTM au rendu.
// Variables : {job_titre} {job_entreprise} {job_ville} {job_url} {jobs_url} {meme_titre}.
// Lien : [texte](url). Le meme s'affiche sous le corps, comme une image intégrée.

window.DL_JOB_MAILS = [
  {
    id: 'job-pls',
    from: ['Ton binôme', 'Équipe Back', 'Équipe Front'],
    subject: ['TR: {job_titre}', 'Ça m\'a fait penser à toi'],
    body: `Tiens, vu que ton Outlook est en PLS depuis hier, ça m'a fait penser à toi.

[{job_titre}, chez {job_entreprise} ({job_ville})]({job_url})

Je dis ça, je dis rien.`,
  },
  {
    id: 'job-point-14h',
    from: ['Ton binôme', 'Équipe Data', 'Équipe mobile'],
    subject: 'Avant le point de cet après-midi',
    body: `Avant le point de {14 h|15 h|16 h 30}, jette un oeil à ça. Sans raison particulière.

[{job_titre} chez {job_entreprise}]({job_url}), {job_ville}.

Supprime ce mail après lecture.`,
  },
  {
    id: 'job-laisse-la',
    from: ['Équipe QA', 'Équipe Infra', 'Ton binôme'],
    subject: 'Je laisse ça là',
    body: `Aucun rapport avec la réunion de ce matin.

[{job_titre}, {job_entreprise}, {job_ville}]({job_url})`,
    tag: 'Envoyé depuis la messagerie perso. Par prudence.',
  },
  {
    id: 'job-cra',
    from: ['Équipe Back', 'Équipe Design'],
    subject: 'Idée pour ton CRA de vendredi',
    body: `Si tu ne sais pas quoi mettre dans ton CRA de la semaine, "veille" passe très bien.

Je commencerais par là : [{job_titre} chez {job_entreprise}]({job_url}).`,
  },
  {
    id: 'job-recrute-pendant',
    from: ['Ton binôme', 'Équipe Front'],
    subject: 'Pendant qu\'on attend le serveur',
    body: `Je constate juste que {job_entreprise} recrute à {job_ville} pendant qu'on rafraîchit la page de statut toutes les 30 secondes.

[{job_titre}]({job_url})

Je ne te conseille rien. Je constate.`,
  },
  {
    id: 'job-renvoi',
    from: ['Équipe Data', 'Équipe Back'],
    subject: 'TR: (renvoi, le premier n\'est pas parti)',
    body: `Je te renvoie mon mail d'hier, il n'est visiblement jamais arrivé.

Résumé : [{job_titre}, {job_entreprise} ({job_ville})]({job_url}). On en parle à la machine à café, pas sur Teams.`,
  },
  {
    id: 'job-stack',
    from: ['Équipe Infra', 'Équipe mobile', 'Ton binôme'],
    subject: 'Ma veille de l\'après-midi',
    body: `Comme je n'ai plus de mails à traiter, je fais de la veille.

Aujourd'hui : [{job_titre} chez {job_entreprise}]({job_url}), {job_ville}.

Très instructif.`,
  },
];

window.DL_SITE_MAILS = [
  {
    id: 'site-plan-b',
    from: ['Ton binôme', 'Équipe Front', 'Équipe Data'],
    subject: 'Mon plan de continuité d\'activité',
    body: `Plan A : attendre que la messagerie revienne.

Plan B : [lesjoiesducode.fr/jobs]({jobs_url})`,
  },
  {
    id: 'site-pour-un-ami',
    from: ['Équipe Back', 'Équipe QA'],
    subject: 'Puisqu\'on ne peut rien faire',
    body: `Puisqu'on ne peut rien faire tant que les mails ne reviennent pas, j'ai fait un tour des offres d'emploi tech des Joies du Code.

C'est pour un ami.

[lesjoiesducode.fr/jobs]({jobs_url})`,
  },
  {
    id: 'site-machine-cafe',
    from: ['Équipe Design', 'Ton binôme'],
    subject: 'Le lien dont on parlait à la machine à café',
    body: `Celui dont on parlait à voix basse : [lesjoiesducode.fr/jobs]({jobs_url})

On ne s'est jamais parlé.`,
  },
  {
    id: 'site-veille',
    from: ['Équipe Infra', 'Équipe mobile'],
    subject: 'Proposition : on fait de la veille',
    body: `Comme on n'a plus de mails à traiter, je propose qu'on fasse de la veille technologique.

J'ai commencé par les offres d'emploi tech : [lesjoiesducode.fr/jobs]({jobs_url}). C'est très instructif. Il y a même des annonces sans "rockstar" ni "ninja" dedans.`,
  },
];

window.DL_MEME_MAILS = [
  { id: 'meme-mdrr', from: ['Ton binôme', 'Équipe Back', 'Équipe QA'], subject: ['mdrr', 'MDRRR'], body: `{mdrr|MDRRR|mdrrrrr|ptdr}` },
  { id: 'meme-penser', from: ['Équipe Front', 'Équipe Data', 'Ton binôme'], subject: 'Ça te fait pas penser à quelqu\'un ?', body: `Ça te fait pas penser à quelqu'un ?

Je dis pas de nom.` },
  { id: 'meme-litteralement', from: ['Équipe mobile', 'Équipe Back', 'Ton binôme'], subject: 'C\'est littéralement {Kevin|Jérôme|Sandrine|Mehdi|Aurélie} ce matin', body: `C'est littéralement {Kevin|Jérôme|Sandrine|Mehdi|Aurélie} ce matin.

Je l'ai vu de mes yeux.` },
  { id: 'meme-daily', from: ['Équipe QA', 'Équipe Front'], subject: 'RE: Daily', body: `Je propose qu'on remplace le daily par ça. Même contenu, 14 minutes de gagnées.` },
  { id: 'meme-trop-vrai', from: ['Équipe Data', 'Équipe Infra'], subject: 'Trop vrai', body: `trop vrai

enfin pas chez nous, évidemment` },
  { id: 'meme-machine-cafe', from: ['Communication interne', 'Ton binôme'], subject: 'Le mème du jour', body: `Je l'ai imprimé et collé sur la machine à café.

Personne ne l'a encore décollé, c'est donc validé par l'ensemble des équipes.` },
  { id: 'meme-ne-pas-transferer', from: ['Équipe Back', 'Équipe Design'], subject: 'Ne pas transférer', body: `Ne pas transférer.

Bon, transfère si tu veux, mais pas au client.` },
  { id: 'meme-chaine', from: ['Équipe {projet}'], subject: 'TR: TR: TR: lol', body: `Reçu de l'équipe {projet}, qui l'a reçu de la compta, qui l'a reçu on ne sait pas d'où.` },
  { id: 'meme-slide', from: ['Ton binôme', 'Équipe Front'], subject: 'Support pour le point de 14 h', body: `Voici le support de présentation pour le point de 14 h.

Il n'y a qu'une slide, mais elle résume bien.` },
  { id: 'meme-telephone', from: ['Équipe Infra', 'Équipe QA'], subject: 'lol', body: `lol

Envoyé depuis mon téléphone, parce que mon Outlook marche pas` },
  { id: 'meme-egayer', from: ['Comité des fêtes', 'Équipe Data'], subject: 'Pour égayer la panne', body: `Puisqu'on ne peut plus travailler, un peu de culture.` },
  { id: 'meme-fond-ecran', from: ['Ton binôme', 'Équipe mobile'], subject: 'Mon nouveau fond d\'écran', body: `Mon nouveau fond d'écran.

Si quelqu'un passe derrière moi pendant une visio, je dis que c'est un schéma d'architecture.` },
];

// Fil de "Répondre à tous" autour d'un meme (arrive en rafale de 3).
window.DL_MEME_THREAD = {
  id: 'meme-fil-mdr',
  from: ['Équipe Back', 'Ton binôme'],
  subject: 'lol (à faire tourner)',
  body: `À faire tourner.`,
  echoes: ['mdr', 'MDR', 'mdrrr', 'ptdr j\'envoie à toute l\'équipe', 'Trop vrai', 'Qui a mis la direction en copie ?', 'Je l\'ai affiché au-dessus de mon bureau'],
};

// Le chef qui fait suivre un meme sur les chefs (meme repéré "chef" dans memes.json).
window.DL_BOSS_MAILS = [
  {
    id: 'boss-like',
    from: ['Ton N+1', 'Ton manager'],
    subject: 'TR: {meme_titre}',
    body: `J'ai vu que tu avais liké ça.

Je ne vois pas ce qu'il y a de drôle.

On en parle à notre point de {14 h|15 h 30|16 h} ?`,
    important: true,
    tag: 'Le like date de 2023. Le point est à 14 h.',
  },
  {
    id: 'boss-direction',
    from: ['Direction'],
    subject: 'Au sujet d\'un mème qui circule',
    body: `Bonjour à tous,

Un mème circule depuis ce matin.

Je tiens à préciser que je l'ai trouvé très drôle et que cela n'a aucun rapport avec les entretiens annuels de la semaine prochaine.`,
  },
];
