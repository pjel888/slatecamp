import {
  House, BookOpen, Cube, ChartLine, Notepad, GearSix,
  Lightning, Target, Brain, Timer, Flag, CheckCircle,
  XCircle, ArrowRight, ArrowLeft, CaretRight, CaretDown,
  MagnifyingGlass, Bell, User, SignOut, Question,
  Exam, Books, Ruler, Buildings, TreeStructure, Compass,
  Certificate, Star, TrendUp, TrendDown, Eye, EyeSlash,
  SpeakerHigh, SpeakerSlash, Sun, Moon, Funnel,
  Play, Pause, Stop, ArrowClockwise, Checks,
  FileText, Image, CubeTransparent, Lightbulb,
  Warning, Info, ShieldCheck, Lock, Sparkle,
  CalendarBlank, Clock, Fire, Heartbeat,
  ListChecks, GridFour, Rows, Stack,
} from '@phosphor-icons/react/dist/ssr'

// Navigation
export const nav = {
  dashboard: House,
  wiki: BookOpen,
  lab3d: Cube,
  analytics: ChartLine,
  notes: Notepad,
  settings: GearSix,
  testing: Exam,
}

// Testing / Quiz
export const quiz = {
  start: Play,
  pause: Pause,
  submit: Checks,
  flag: Flag,
  next: ArrowRight,
  prev: ArrowLeft,
  correct: CheckCircle,
  incorrect: XCircle,
  timer: Timer,
  question: Question,
  explanation: Lightbulb,
  viewImage: Image,
  view3d: CubeTransparent,
}

// Analytics / Progress
export const progress = {
  readiness: Target,
  trendUp: TrendUp,
  trendDown: TrendDown,
  streak: Fire,
  heartbeat: Heartbeat,
  focusReview: Brain,
  endurance: Lightning,
  fullSimulation: Certificate,
}

// Subjects (LEA)
export const subjects = {
  structural: Buildings,
  utilities: TreeStructure,
  laws: FileText,
  history: Compass,
  practice: Certificate,
  sitePlanning: Ruler,
}

// UI Actions
export const actions = {
  search: MagnifyingGlass,
  filter: Funnel,
  notification: Bell,
  user: User,
  signOut: SignOut,
  audioOn: SpeakerHigh,
  audioOff: SpeakerSlash,
  lightMode: Sun,
  darkMode: Moon,
  expand: CaretDown,
  navigate: CaretRight,
  refresh: ArrowClockwise,
  eye: Eye,
  eyeOff: EyeSlash,
}

// Status
export const status = {
  success: CheckCircle,
  warning: Warning,
  error: XCircle,
  info: Info,
  locked: Lock,
  verified: ShieldCheck,
  premium: Sparkle,
  star: Star,
}

// Content
export const content = {
  article: FileText,
  image: Image,
  model3d: CubeTransparent,
  note: Notepad,
  books: Books,
  calendar: CalendarBlank,
  clock: Clock,
  listView: ListChecks,
  gridView: GridFour,
  rowView: Rows,
  stackView: Stack,
}
