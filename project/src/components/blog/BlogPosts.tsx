import { Container } from '../layout/Container';
import { Card } from '../ui/Card';
import { Stagger } from '../ui/animations/Stagger';
import { Ripple } from '../ui/animations/Ripple';

const posts = [
  {
    title: "Introducing Cliquest",
    excerpt: "A new way to collaborate on creative projects.",
    category: "Product Updates",
    date: "Oct 15, 2023",
    readTime: "5 min read"
  },
  {
    title: "Building in Public",
    excerpt: "Our journey of transparent development.",
    category: "Company",
    date: "Oct 10, 2023",
    readTime: "4 min read"
  },
  {
    title: "The Future of Creative Collaboration",
    excerpt: "How we're reimagining team workflows.",
    category: "Vision",
    date: "Oct 5, 2023",
    readTime: "6 min read"
  }
];

export function BlogPosts() {
  return (
    <section className="py-24 bg-white">
      <Container>
        <div className="max-w-4xl mx-auto">
          <Stagger>
            {posts.map((post) => (
              <Ripple key={post.title} className="mb-8">
                <Card className="p-8">
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <span>{post.category}</span>
                    <span>•</span>
                    <span>{post.date}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h2 className="text-2xl font-medium mb-3">{post.title}</h2>
                  <p className="text-gray-600">{post.excerpt}</p>
                </Card>
              </Ripple>
            ))}
          </Stagger>
        </div>
      </Container>
    </section>
  );
}