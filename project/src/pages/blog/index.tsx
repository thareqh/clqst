import { PageLayout } from '../../components/layout/PageLayout';
import { BlogHero } from '../../components/blog/BlogHero';
import { BlogPosts } from '../../components/blog/BlogPosts';
import { BlogNewsletter } from '../../components/blog/BlogNewsletter';

export default function BlogPage() {
  return (
    <PageLayout>
      <BlogHero />
      <BlogPosts />
      <BlogNewsletter />
    </PageLayout>
  );
}