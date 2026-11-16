/**
 * Resources for the audience, on the screen before the credits. Each one gets a QR code, so people can scan it from
 * their seat. Edit freely: `url` is what the QR code opens, `shown` is the short address written under it.
 */
export interface Resource {
  kind: 'tiktok' | 'instagram' | 'web'
  name: string
  /** One line under the name: what it is, or the language it is in. */
  about: string
  url: string
  shown: string
  language?: 'English' | 'Arabic' | 'French'
}

export const follow: Resource[] = [
  {
    kind: 'tiktok',
    name: '@missy23232',
    about: 'Interview tips on TikTok',
    url: 'https://www.tiktok.com/@missy23232',
    shown: 'tiktok.com/@missy23232',
    language: 'English',
  },
  {
    kind: 'instagram',
    name: '@kaoutar.benali',
    about: 'Interview tips on Instagram',
    url: 'https://www.instagram.com/kaoutar.benali/',
    shown: 'instagram.com/kaoutar.benali',
    language: 'Arabic',
  },
  {
    kind: 'instagram',
    name: '@stephaniereniers',
    about: 'Interview tips on Instagram',
    url: 'https://www.instagram.com/stephaniereniers/',
    shown: 'instagram.com/stephaniereniers',
    language: 'French',
  },
]

export const practise: Resource[] = [
  {
    kind: 'web',
    name: 'Big Interview',
    about: 'Practice mock interviews and receive feedback on your answers and delivery.',
    url: 'https://www.biginterview.com/',
    shown: 'biginterview.com',
  },
  {
    kind: 'web',
    name: 'The Muse',
    about: 'Explore common interview questions, sample answers, and preparation tips.',
    url: 'https://www.themuse.com/',
    shown: 'themuse.com',
  },
  {
    kind: 'web',
    name: 'Grow with Google',
    about: 'Learn how to prepare before an interview and follow up afterward.',
    url: 'https://grow.google/',
    shown: 'grow.google',
  },
]
