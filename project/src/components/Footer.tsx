import { Container } from './layout/Container';

export function Footer() {
  return (
    <footer className="border-t border-gray-200">
      <Container className="py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <a href="#help" className="hover:text-gray-900 transition-colors">Help</a>
            <span>•</span>
            <a href="#privacy" className="hover:text-gray-900 transition-colors">Privacy</a>
            <span>•</span>
            <a href="#terms" className="hover:text-gray-900 transition-colors">Terms</a>
            <span>•</span>
            <a href="#blog" className="hover:text-gray-900 transition-colors">Blog</a>
          </div>
          <div className="text-sm text-gray-600">
            © {new Date().getFullYear()} Cliquest
          </div>
        </div>
      </Container>
    </footer>
  );
}