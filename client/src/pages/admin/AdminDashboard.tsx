import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronRight, 
  Users, 
  Video, 
  Calendar, 
  Music, 
  Image, 
  BarChart3, 
  Settings, 
  Ticket,
  Radio 
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [location, navigate] = useLocation();

  // Define a type for user data
  type UserProfile = {
    role: string;
    [key: string]: any;
  };

  // Check if the user is an admin
  const { data: userData, isLoading: userLoading } = useQuery<UserProfile>({
    queryKey: ['/api/users/profile'],
    enabled: !!user,
  });

  if (userLoading) {
    return (
      <div className="container py-10">
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-current border-r-transparent align-middle">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-4 text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect if user is not an admin
  if (userData && userData.role !== 'admin') {
    toast({
      title: 'Access denied',
      description: 'You do not have permission to access the admin dashboard.',
      variant: 'destructive',
    });
    navigate('/');
    return null;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagementPlaceholder />;
      case 'videos':
        return <ContentManagementPlaceholder type="videos" />;
      case 'events':
        return <ContentManagementPlaceholder type="events" />;
      case 'music':
        return <ContentManagementPlaceholder type="music" />;
      case 'gallery':
        return <ContentManagementPlaceholder type="gallery" />;
      case 'tickets':
        return <ContentManagementPlaceholder type="tickets" />;
      case 'streams':
        return <StreamManagement />;
      default:
        return (
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Admin Dashboard</CardTitle>
                <CardDescription>
                  Welcome to the Full Fuel TV admin dashboard. Manage your content and users from here.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <DashboardCard 
                    title="Users" 
                    description="Manage user accounts" 
                    icon={<Users className="w-5 h-5 text-blue-500" />}
                    count={10}
                    onClick={() => setActiveTab('users')}
                  />
                  <DashboardCard 
                    title="Videos" 
                    description="Manage video content" 
                    icon={<Video className="w-5 h-5 text-red-500" />}
                    count={24}
                    onClick={() => setActiveTab('videos')}
                  />
                  <DashboardCard 
                    title="Events" 
                    description="Manage events" 
                    icon={<Calendar className="w-5 h-5 text-green-500" />}
                    count={8}
                    onClick={() => setActiveTab('events')}
                  />
                  <DashboardCard 
                    title="Music" 
                    description="Manage music and mixes" 
                    icon={<Music className="w-5 h-5 text-purple-500" />}
                    count={15}
                    onClick={() => setActiveTab('music')}
                  />
                  <DashboardCard 
                    title="Gallery" 
                    description="Manage gallery images" 
                    icon={<Image className="w-5 h-5 text-yellow-500" />}
                    count={42}
                    onClick={() => setActiveTab('gallery')}
                  />
                  <DashboardCard 
                    title="Tickets" 
                    description="Manage ticket sales" 
                    icon={<Ticket className="w-5 h-5 text-orange-500" />}
                    count={56}
                    onClick={() => setActiveTab('tickets')}
                  />
                  <DashboardCard 
                    title="Streams" 
                    description="Manage live streams" 
                    icon={<Radio className="w-5 h-5 text-pink-500" />}
                    count={12}
                    onClick={() => setActiveTab('streams')}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>Overview of your platform's performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <StatCard title="Total Users" value="152" change="+12%" />
                  <StatCard title="Active Subscribers" value="87" change="+5%" />
                  <StatCard title="Monthly Views" value="2.4k" change="+18%" />
                  <StatCard title="Ticket Sales" value="$1,245" change="+23%" />
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button variant="outline" onClick={() => navigate('/')}>
          Back to Site
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <div className="space-y-1">
            <Button
              variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('dashboard')}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Button
              variant={activeTab === 'users' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('users')}
            >
              <Users className="mr-2 h-4 w-4" />
              Users
            </Button>
            <Button
              variant={activeTab === 'videos' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('videos')}
            >
              <Video className="mr-2 h-4 w-4" />
              Videos
            </Button>
            <Button
              variant={activeTab === 'events' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('events')}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Events
            </Button>
            <Button
              variant={activeTab === 'music' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('music')}
            >
              <Music className="mr-2 h-4 w-4" />
              Music
            </Button>
            <Button
              variant={activeTab === 'gallery' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('gallery')}
            >
              <Image className="mr-2 h-4 w-4" />
              Gallery
            </Button>
            <Button
              variant={activeTab === 'tickets' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('tickets')}
            >
              <Ticket className="mr-2 h-4 w-4" />
              Tickets
            </Button>
            <Button
              variant={activeTab === 'streams' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('streams')}
            >
              <Radio className="mr-2 h-4 w-4" />
              Streams
            </Button>
            <Separator className="my-2" />
            <Button
              variant={activeTab === 'settings' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('settings')}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>
        
        <div className="md:col-span-3">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}

// Helper Components
type DashboardCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  count: number;
  onClick: () => void;
};

function DashboardCard({ title, description, icon, count, onClick }: DashboardCardProps) {
  return (
    <div 
      className="bg-card border rounded-lg p-4 flex justify-between items-center cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <div className="bg-secondary p-2 rounded-full">
          {icon}
        </div>
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex items-center">
        <span className="font-semibold mr-2">{count}</span>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>
    </div>
  );
}

type StatCardProps = {
  title: string;
  value: string;
  change: string;
};

function StatCard({ title, value, change }: StatCardProps) {
  const isPositive = change.startsWith('+');
  
  return (
    <div className="bg-card border rounded-lg p-4">
      <h3 className="text-sm text-muted-foreground">{title}</h3>
      <div className="flex items-end justify-between mt-2">
        <span className="text-2xl font-bold">{value}</span>
        <span className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {change}
        </span>
      </div>
    </div>
  );
}

// Placeholder components for the content management sections
// To be replaced with actual implementations
function UserManagementPlaceholder() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          View and manage all registered users on the platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="font-medium">Name</div>
            <div className="font-medium">Email</div>
            <div className="font-medium">Role</div>
            <div className="font-medium">Actions</div>
          </div>
          <div className="divide-y">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <span>User {item}</span>
                </div>
                <div>user{item}@example.com</div>
                <div>{item === 1 ? 'Admin' : 'User'}</div>
                <div>
                  <Button variant="ghost" size="sm">Edit</Button>
                  <Button variant="ghost" size="sm" className="text-red-500">Delete</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button>Add New User</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Stream Management Component
function StreamManagement() {
  const [streams, setStreams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingStream, setEditingStream] = useState(null);
  const { toast } = useToast();

  // Fetch streams
  const { data: streamsData, refetch, isLoading: streamsLoading, error: streamsError } = useQuery({
    queryKey: ['/api/streams/all'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      console.log('Fetching streams with token:', token ? 'Present' : 'Missing');
      
      const response = await fetch('/api/streams/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Streams API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Streams API error:', errorText);
        throw new Error(`Failed to fetch streams: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Streams data:', data);
      return data;
    }
  });

  if (streamsError) {
    console.error('Streams query error:', streamsError);
  }

  const handleDeleteStream = async (streamId: string) => {
    if (!confirm('Are you sure you want to delete this stream?')) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/streams/${streamId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        toast({ title: 'Stream deleted successfully' });
        refetch();
      } else {
        throw new Error('Failed to delete stream');
      }
    } catch (error) {
      toast({ title: 'Error deleting stream', variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Stream Management</CardTitle>
            <CardDescription>
              Manage live streams, create new streams, and update existing ones.
            </CardDescription>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Radio className="mr-2 h-4 w-4" />
            Add New Stream
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showCreateForm && (
          <div className="mb-6 p-4 border rounded-lg bg-muted/50">
            <StreamForm 
              stream={editingStream}
              onSave={() => {
                setShowCreateForm(false);
                setEditingStream(null);
                refetch();
              }}
              onCancel={() => {
                setShowCreateForm(false);
                setEditingStream(null);
              }}
            />
          </div>
        )}
        
        <div className="rounded-md border">
          <div className="grid grid-cols-6 gap-4 p-4 border-b font-medium">
            <div>Title</div>
            <div>Artist</div>
            <div>Type</div>
            <div>Scheduled Date</div>
            <div>Status</div>
            <div>Actions</div>
          </div>
          <div className="divide-y">
            {streamsLoading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-solid border-current border-r-transparent"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading streams...</p>
              </div>
            ) : streamsError ? (
              <div className="p-8 text-center text-red-500">
                <p>Error loading streams: {streamsError.message}</p>
                <Button onClick={() => refetch()} className="mt-2">Retry</Button>
              </div>
            ) : streamsData && streamsData.length > 0 ? (
              streamsData.map((stream: any) => (
              <div key={stream.id} className="grid grid-cols-6 gap-4 p-4 items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <Radio className="w-4 h-4" />
                  </div>
                  <span className="font-medium">{stream.title}</span>
                </div>
                <div>{stream.artist}</div>
                <div>
                  <span className={`px-2 py-1 text-xs rounded-sm ${
                    stream.streamType === 'festival' ? 'bg-purple-900/30 text-purple-400' :
                    stream.streamType === 'club' ? 'bg-blue-900/30 text-blue-400' :
                    stream.streamType === 'dj-set' ? 'bg-green-900/30 text-green-400' :
                    'bg-orange-900/30 text-orange-400'
                  }`}>
                    {stream.streamType}
                  </span>
                </div>
                <div>{new Date(stream.scheduledDate).toLocaleDateString()}</div>
                <div>
                  <span className={`px-2 py-1 text-xs rounded-sm ${
                    stream.streamStatus === 'live' ? 'bg-red-900/30 text-red-400' :
                    stream.streamStatus === 'scheduled' ? 'bg-yellow-900/30 text-yellow-400' :
                    'bg-gray-900/30 text-gray-400'
                  }`}>
                    {stream.streamStatus}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setEditingStream(stream);
                      setShowCreateForm(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500"
                    onClick={() => handleDeleteStream(stream.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                No streams found. Create your first stream!
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Stream Form Component
function StreamForm({ stream, onSave, onCancel }: { stream?: any; onSave: () => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    title: stream?.title || '',
    description: stream?.description || '',
    artist: stream?.artist || '',
    scheduledDate: stream?.scheduledDate ? new Date(stream.scheduledDate).toISOString().slice(0, 16) : '',
    streamType: stream?.streamType || 'festival',
    thumbnailUrl: stream?.thumbnailUrl || '',
    youtubeId: stream?.youtubeId || '',
    expectedViewers: stream?.expectedViewers || 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('auth_token');
      const url = stream ? `/api/streams/${stream.id}` : '/api/streams';
      const method = stream ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          scheduledDate: new Date(formData.scheduledDate),
          expectedViewers: parseInt(formData.expectedViewers.toString())
        })
      });

      if (response.ok) {
        toast({ title: `Stream ${stream ? 'updated' : 'created'} successfully` });
        onSave();
      } else {
        throw new Error(`Failed to ${stream ? 'update' : 'create'} stream`);
      }
    } catch (error) {
      toast({ title: `Error ${stream ? 'updating' : 'creating'} stream`, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full p-2 border rounded-md bg-background"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Artist</label>
          <input
            type="text"
            value={formData.artist}
            onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
            className="w-full p-2 border rounded-md bg-background"
            required
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full p-2 border rounded-md bg-background"
          rows={3}
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Stream Type</label>
          <select
            value={formData.streamType}
            onChange={(e) => setFormData({ ...formData, streamType: e.target.value })}
            className="w-full p-2 border rounded-md bg-background"
          >
            <option value="festival">Festival</option>
            <option value="club">Club</option>
            <option value="dj-set">DJ Set</option>
            <option value="premiere">Premiere</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Scheduled Date</label>
          <input
            type="datetime-local"
            value={formData.scheduledDate}
            onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
            className="w-full p-2 border rounded-md bg-background"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Thumbnail URL (Imgur)</label>
          <input
            type="url"
            value={formData.thumbnailUrl}
            onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
            className="w-full p-2 border rounded-md bg-background"
            placeholder="https://i.imgur.com/..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Expected Viewers</label>
          <input
            type="number"
            value={formData.expectedViewers}
            onChange={(e) => setFormData({ ...formData, expectedViewers: parseInt(e.target.value) || 0 })}
            className="w-full p-2 border rounded-md bg-background"
            min="0"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">YouTube ID (optional)</label>
        <input
          type="text"
          value={formData.youtubeId}
          onChange={(e) => setFormData({ ...formData, youtubeId: e.target.value })}
          className="w-full p-2 border rounded-md bg-background"
          placeholder="dQw4w9WgXcQ"
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : (stream ? 'Update Stream' : 'Create Stream')}
        </Button>
      </div>
    </form>
  );
}

type ContentType = 'videos' | 'events' | 'music' | 'gallery' | 'tickets';

function ContentManagementPlaceholder({ type }: { type: ContentType }) {
  const typeMapping = {
    videos: {
      title: 'Video Management',
      description: 'Manage video content, add new videos, and update existing ones.',
      icon: <Video className="w-4 h-4" />,
      fields: ['Title', 'Category', 'Duration', 'Upload Date'],
    },
    events: {
      title: 'Event Management',
      description: 'Manage events, create new events, and update existing ones.',
      icon: <Calendar className="w-4 h-4" />,
      fields: ['Event Name', 'Date', 'Location', 'Tickets Available'],
    },
    music: {
      title: 'Music Management',
      description: 'Manage music mixes and tracks on the platform.',
      icon: <Music className="w-4 h-4" />,
      fields: ['Title', 'Artist', 'Duration', 'Release Date'],
    },
    gallery: {
      title: 'Gallery Management',
      description: 'Manage gallery images and collections.',
      icon: <Image className="w-4 h-4" />,
      fields: ['Title', 'Collection', 'Upload Date', 'Status'],
    },
    tickets: {
      title: 'Ticket Management',
      description: 'Manage ticket sales, prices, and availability.',
      icon: <Ticket className="w-4 h-4" />,
      fields: ['Event', 'Price', 'Sold', 'Available'],
    },
  };

  const { title, description, icon, fields } = typeMapping[type];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <div className="flex items-center justify-between p-4 border-b">
            {fields.map((field) => (
              <div key={field} className="font-medium">{field}</div>
            ))}
            <div className="font-medium">Actions</div>
          </div>
          <div className="divide-y">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-center justify-between p-4">
                {fields.map((field, index) => (
                  <div key={index}>
                    {index === 0 ? (
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                          {icon}
                        </div>
                        <span>{`${type.slice(0, -1)} ${item}`}</span>
                      </div>
                    ) : (
                      <span>Sample data</span>
                    )}
                  </div>
                ))}
                <div>
                  <Button variant="ghost" size="sm">Edit</Button>
                  <Button variant="ghost" size="sm" className="text-red-500">Delete</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button>{`Add New ${type.slice(0, -1).charAt(0).toUpperCase() + type.slice(0, -1).slice(1)}`}</Button>
        </div>
      </CardContent>
    </Card>
  );
}