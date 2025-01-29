import { IconType } from 'react-icons';
import {
  HiGlobeAlt,
  HiDeviceMobile,
  HiDesktopComputer,
  HiCube
} from 'react-icons/hi';

interface Category {
  id: "web" | "mobile" | "desktop" | "other";
  name: string;
  icon: IconType;
  iconElement?: React.ReactNode;
}

export const PROJECT_CATEGORIES: Category[] = [
  {
    id: "web",
    name: "Web Application",
    icon: HiGlobeAlt,
    iconElement: <HiGlobeAlt className="w-4 h-4" />
  },
  {
    id: "mobile",
    name: "Mobile Application",
    icon: HiDeviceMobile,
    iconElement: <HiDeviceMobile className="w-4 h-4" />
  },
  {
    id: "desktop",
    name: "Desktop Application",
    icon: HiDesktopComputer,
    iconElement: <HiDesktopComputer className="w-4 h-4" />
  },
  {
    id: "other",
    name: "Other",
    icon: HiCube,
    iconElement: <HiCube className="w-4 h-4" />
  }
];

export type ProjectCategory = typeof PROJECT_CATEGORIES[number]['id'];