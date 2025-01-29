declare module '@heroicons/react/24/outline' {
  import { ComponentProps } from 'react';
  
  export type IconProps = ComponentProps<'svg'>;

  export const PaperClipIcon: (props: IconProps) => JSX.Element;
  export const PaperAirplaneIcon: (props: IconProps) => JSX.Element;
  export const FaceSmileIcon: (props: IconProps) => JSX.Element;
  export const UserGroupIcon: (props: IconProps) => JSX.Element;
  export const Cog6ToothIcon: (props: IconProps) => JSX.Element;
  export const BellIcon: (props: IconProps) => JSX.Element;
  export const ChatBubbleLeftIcon: (props: IconProps) => JSX.Element;
  export const EllipsisVerticalIcon: (props: IconProps) => JSX.Element;
  export const MagnifyingGlassIcon: (props: IconProps) => JSX.Element;
  export const FunnelIcon: (props: IconProps) => JSX.Element;
}

declare module '@heroicons/react/outline' {
  export const SearchIcon: React.FC<React.SVGProps<SVGSVGElement>>;
  export const FilterIcon: React.FC<React.SVGProps<SVGSVGElement>>;
  // Add other icons as needed
} 