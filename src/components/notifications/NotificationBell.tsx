import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

export default function NotificationBell() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const { data: notifications } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(10);
      
      return data || [];
    },
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
  
  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const handleNotificationClick = (notification: any) => {
    markAsRead.mutate(notification.id);
    
    // Navigate based on entity type
    if (notification.entity_type === 'product' && notification.entity_id) {
      navigate(`/products/${notification.entity_id}`);
    } else if (notification.entity_type === 'invoice' && notification.entity_id) {
      navigate(`/invoices/${notification.entity_id}`);
    } else if (notification.entity_type === 'subscription') {
      navigate('/billing');
    }
  };
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {notifications && notifications.length > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-destructive-foreground">
              {notifications.length > 9 ? '9+' : notifications.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold">Notifications</h3>
          {notifications && notifications.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/notifications')}
            >
              View All
            </Button>
          )}
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {!notifications || notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>No new notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className="p-4 hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="font-medium text-sm mb-1">{notification.title}</div>
                  <div className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {notification.message}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
