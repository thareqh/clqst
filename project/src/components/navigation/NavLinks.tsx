import { NavLink } from './NavLink';

const navigation = [
  { name: 'Features', href: '#features' },
  { name: 'Solutions', href: '#solutions' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'About', href: '#about' },
] as const;

export function NavLinks() {
  return (
    <div className="hidden lg:flex lg:gap-x-8">
      {navigation.map((item) => (
        <NavLink key={item.name} href={item.href}>
          {item.name}
        </NavLink>
      ))}
      <NavLink
        href="#get-started"
        className="text-white bg-primary-600 px-4 py-2 rounded-lg hover:bg-primary-700"
      >
        Try Free
      </NavLink>
    </div>
  );
}