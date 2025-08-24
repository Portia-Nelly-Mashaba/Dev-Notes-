import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotes } from '@/hooks/useNotes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, TrendingUp, Clock, Star, Code2, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { Note } from '@/types';

// Simulated blog posts from shared notes
const generateBlogPosts = (notes: Note[]) => {
  return notes
    .filter(note => note.sharedWith && note.sharedWith.length > 0)
    .map(note => ({
      ...note,
      author: `User${Math.floor(Math.random() * 1000)}`,
      views: Math.floor(Math.random() * 500) + 50,
      likes: Math.floor(Math.random() * 100) + 10,
      publishedAt: note.updatedAt,
    }));
};

const Blog = () => {
  const navigate = useNavigate();
  const { allNotes } = useNotes();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const blogPosts = generateBlogPosts(allNotes);
  
  // Add some featured community posts
  const featuredPosts = [
    {
      id: 'featured-1',
      title: 'Advanced React Patterns for 2024',
      content: 'Exploring the latest React patterns including Compound Components, Render Props evolution...',
      type: 'tutorial' as const,
      language: 'javascript',
      tags: ['react', 'patterns', 'advanced'],
      author: 'ReactMaster',
      views: 1250,
      likes: 89,
      publishedAt: new Date('2024-01-20'),
      isFavorite: false,
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20'),
      sharedWith: ['community']
    },
    {
      id: 'featured-2',
      title: 'Database Optimization Strategies',
      content: 'Deep dive into PostgreSQL performance tuning, indexing strategies, and query optimization...',
      type: 'tutorial' as const,
      language: 'sql',
      tags: ['database', 'postgresql', 'performance'],
      author: 'DBExpert',
      views: 920,
      likes: 67,
      publishedAt: new Date('2024-01-18'),
      isFavorite: false,
      createdAt: new Date('2024-01-18'),
      updatedAt: new Date('2024-01-18'),
      sharedWith: ['community']
    }
  ];

  const allPosts = [...featuredPosts, ...blogPosts];

  const filteredPosts = allPosts.filter(post => {
    const matchesSearch = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || post.type === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', 'snippet', 'tutorial', 'tool', 'project'];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">DevNotes Community Blog</h1>
                <p className="text-muted-foreground">Share knowledge, learn together</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline">
                <TrendingUp className="h-4 w-4 mr-2" />
                Trending
              </Button>
              <Link to="/">
                <Button>
                  <FileText className="h-4 w-4 mr-2" />
                  Share Your Note
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search community posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Featured Section */}
        {searchQuery === '' && selectedCategory === 'all' && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Featured Posts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredPosts.slice(0, 2).map(post => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Badge variant="outline" className="text-xs">
                            {post.type}
                          </Badge>
                          {post.language && (
                            <Badge variant="secondary" className="text-xs flex items-center gap-1">
                              <Code2 className="h-3 w-3" />
                              {post.language}
                            </Badge>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(post.publishedAt, 'MMM d')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {post.content.slice(0, 150)}...
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>by {post.author}</span>
                        <span>{post.views} views</span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {post.likes}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {post.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Community Posts */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">
            {searchQuery || selectedCategory !== 'all' ? 'Search Results' : 'Recent Community Posts'}
          </h2>
          
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No posts found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Try adjusting your search terms.' : 'Be the first to share your knowledge!'}
              </p>
              <Link to="/">
                <Button>Share Your First Note</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map(post => (
                <Card key={post.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{post.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            {post.type}
                          </Badge>
                          {post.language && (
                            <Badge variant="secondary" className="text-xs flex items-center gap-1">
                              <Code2 className="h-3 w-3" />
                              {post.language}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-muted-foreground mb-3">
                          {post.content.slice(0, 200)}...
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>by {post.author}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(post.publishedAt, 'MMM d, yyyy')}
                            </span>
                            <span>{post.views} views</span>
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              {post.likes}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            {post.tags.slice(0, 4).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Call to Action */}
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">Share Your Knowledge</h3>
            <p className="text-muted-foreground mb-4">
              Got a useful code snippet, tutorial, or solution? Share it with the community!
            </p>
            <div className="flex justify-center gap-2">
              <Link to="/">
                <Button>
                  <FileText className="h-4 w-4 mr-2" />
                  Create Note
                </Button>
              </Link>
              <Button variant="outline">
                Learn More
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Blog;