/**
 * The seven professionals, one per scene. THIS IS THE FILE TO EDIT when a clip changes:
 *   1. put the files in app/public/media/ (tools/media/prepare.py converts and levels them, see the README),
 *   2. put the subtitles in app/subtitles/<file>.vtt,
 *   3. fill in the person below.
 * Show only what each person agreed to: `name: null` shows the job title only, `company: null` hides the workplace,
 * `photo: null` shows an icon, `linkedin: null` hides the LinkedIn line and the QR code.
 */
export type Field = 'Cybersecurity' | 'Consulting' | 'Information Systems' | 'Data' | 'Engineering' | 'Business' | 'Human Resources'

export interface Expert {
  scene: number
  /** True for a stand-in clip made for rehearsals: shows an EXAMPLE tag. */
  example: boolean
  media: {
    kind: 'video' | 'audio'
    /** Base name in app/public/media/: <file>.webm and <file>.mp4 (video) or <file>.webm and <file>.m4a (voice note). */
    file: string
    /** Video only: phone videos are 'portrait'. */
    orientation?: 'landscape' | 'portrait'
    /** Video only: 'contain' shows the whole picture (bars above and below) instead of filling the frame. */
    fit?: 'cover' | 'contain'
    /** What the person speaks. French gets English subtitles; English gets English subtitles. */
    language: 'en' | 'fr'
  }
  person: {
    name: string | null
    jobTitle: string
    company: string | null
    /** The person's profile, shown in the tag under their name. */
    profile: string
    /** Only picks the colour of the tag. */
    field: Field
    /** File in app/public/media/, or null. */
    photo: string | null
    linkedin: string | null
  }
}

export const experts: Expert[] = [
  {
    scene: 1,
    example: false,
    media: { kind: 'video', file: 'scene-1-abir-sakhi', orientation: 'landscape', language: 'en' },
    person: {
      name: 'Abir Sakhi',
      jobTitle: 'Cybersecurity Analyst',
      company: 'Teleperformance',
      profile: 'Cybersecurity Engineer',
      field: 'Cybersecurity',
      photo: 'abir-sakhi-photo.jpg',
      linkedin: 'https://www.linkedin.com/in/abir-sakhi/',
    },
  },
  {
    scene: 2,
    example: false,
    media: { kind: 'video', file: 'scene-2-malak-hajjaj', orientation: 'landscape', language: 'en' },
    person: {
      name: 'Malak Hajjaj',
      jobTitle: 'Consultant',
      company: 'Deloitte',
      profile: 'HRIS Consultant',
      field: 'Consulting',
      photo: 'malak-hajjaj-photo.jpg',
      linkedin: 'https://www.linkedin.com/in/malak-hajjaj-1048b22ab/',
    },
  },
  {
    scene: 3,
    example: false,
    // A screen-recorded video call: only the two video tiles are kept, shown whole.
    media: { kind: 'video', file: 'scene-3-saifeddine-elkadiri', orientation: 'landscape', fit: 'contain', language: 'en' },
    person: {
      name: 'Sifeddine El Kadiri',
      jobTitle: 'Logistics Manager',
      company: 'Forum GENI Entreprises',
      profile: 'Finance & Computer Science',
      field: 'Business',
      photo: 'saifeddine-elkadiri-photo.jpg',
      linkedin: 'https://www.linkedin.com/in/sifeddine-e-097235390/',
    },
  },
  {
    scene: 4,
    example: false,
    media: { kind: 'audio', file: 'scene-4-youssef-ennaciri', language: 'fr' },
    person: {
      name: 'Youssef Ennaciri',
      jobTitle: 'Head of Information Systems · Business Analyst',
      company: 'Hôpital Universitaire International Cheikh Zaid',
      profile: 'IS Consultant · Data Analysis',
      field: 'Information Systems',
      photo: 'youssef-ennaciri-photo.jpg',
      linkedin: 'https://www.linkedin.com/in/ennaciri99/',
    },
  },
  {
    scene: 5,
    example: false,
    media: { kind: 'video', file: 'scene-5-taha-jaid', orientation: 'landscape', language: 'fr' },
    person: {
      name: 'Taha Jaid',
      jobTitle: 'SOC Manager',
      company: 'AMANDIGITAL',
      profile: 'Cybersecurity Engineer',
      field: 'Cybersecurity',
      photo: 'taha-jaid-photo.jpg',
      linkedin: 'https://www.linkedin.com/in/tahajaid/',
    },
  },
  {
    scene: 6,
    example: false,
    media: { kind: 'audio', file: 'scene-6-salma-el-mrharraz', language: 'en' },
    person: {
      name: 'Salma El Mrharraz',
      jobTitle: 'Data Engineer',
      company: 'Ciril Group',
      profile: 'Data Engineering',
      field: 'Data',
      photo: 'salma-el-mrharraz-photo.jpg',
      linkedin: 'https://www.linkedin.com/in/salma-el-mrharraz-b25769211/',
    },
  },
  {
    scene: 7,
    example: false,
    // He keeps his workplace private: no company, no photo, no LinkedIn. The call was recorded with the camera off,
    // so it plays as a voice note.
    media: { kind: 'audio', file: 'scene-7-yousef-med', language: 'fr' },
    person: {
      name: 'Youssef Med',
      jobTitle: 'Aeronautical Engineer',
      company: null,
      profile: 'Aeronautical Engineering',
      field: 'Engineering',
      photo: null,
      linkedin: null,
    },
  },
]

const subtitleFiles = import.meta.glob<string>('../subtitles/*.vtt', { query: '?raw', import: 'default', eager: true })
const waveformFiles = import.meta.glob<number[]>('./waveforms/*.json', { import: 'default', eager: true })

/** The subtitles of a clip (empty when the file is missing: the clip still plays). */
export function subtitlesFor(file: string): string {
  return subtitleFiles[`../subtitles/${file}.vtt`] ?? ''
}

/** The loudness envelope of a voice note, 30 values a second (empty when missing: the ring then breathes gently). */
export function waveformFor(file: string): number[] {
  return waveformFiles[`./waveforms/${file}.json`] ?? []
}
