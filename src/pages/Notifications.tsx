import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, Trash2, AlertTriangle, Info, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function Notifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [filter, setFilter] = useState<string>("all");

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications-page', user?.id, filter],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        if (filter === 'unread') {
          query = query.eq('is_read', false);
        } else {
          query = query.eq('type', filter);
        }
      }

      const { data } = await query;
      return data || [];
    },
    enabled: !!user
  });

  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-page'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!user) return;
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-page'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({ title: "All notifications marked as read" });
    }
  });

  const deleteNotification = useMutation({
    mutationFn: async (notificationId: string) => {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-page'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({ title: "Notification deleted" });
    }
  });

  const handleNotificationClick = (notification: any) => {
    if (!notification.is_read) {
      markAsRead.mutate(notification.id);
    }
    
    if (notification.entity_type === 'product' && notification.entity_id) {
      navigate(`/products/${notification.entity_id}`);
    } else if (notification.entity_type === 'invoice' && notification.entity_id) {
      navigate(`/invoices/${notification.entity_id}`);
    } else if (notification.entity_type === 'subscription') {
      navigate('/billing');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'low_stock_alert':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'overdue_invoice':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'subscription_expiring':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'business_insight':
        return <Sparkles className="h-5 w-5 text-primary" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const filters = [
    { value: 'all', label: 'All' },
    { value: 'unread', label: 'Unread' },
    { value: 'low_stock_alert', label: 'Stock Alerts' },
    { value: 'overdue_invoice', label: 'Overdue' },
    { value: 'subscription_expiring', label: 'Subscription' },
    { value: 'business_insight', label: 'AI Insights' },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground">Stay updated with your business alerts</p>
          </div>
          {notifications && notifications.some(n => !n.is_read) && (
            <Button variant="outline" onClick={() => markAllAsRead.mutate()}>
              <Check className="mr-2 h-4 w-4" />
              Mark All Read
            </Button>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {filters.map(f => (
            <Button
              key={f.value}
              variant={filter === f.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="flex gap-4">
                  <div className="h-12 w-12 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-muted rounded w-1/4"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : !notifications || notifications.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
              <h3 className="text-lg font-semibold mb-2">No notifications</h3>
              <p className="text-muted-foreground">
                {filter === 'unread' 
                  ? "You're all caught up!" 
                  : "No notifications to display"}
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map(notification => (
              <Card 
                key={notification.id}
                className={`p-6 transition-all ${
                  notification.is_read ? 'opacity-60' : 'border-l-4 border-l-primary'
                }`}
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold">{notification.title}</h3>
                      {!notification.is_read && (
                        <Badge variant="default" className="ml-2">New</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 whitespace-pre-line">
                      {notification.message}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!notification.is_read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead.mutate(notification.id);
                        }}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification.mutate(notification.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
