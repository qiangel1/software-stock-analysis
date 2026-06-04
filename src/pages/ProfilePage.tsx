/**
 * Profile Page
 * 
 * User profile and settings.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Switch,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Person,
  Settings,
  Security,
  Notifications,
  Help,
  Info,
  Logout,
  Star,
  AccountBalanceWallet,
} from '@mui/icons-material';
import { RiskDisclaimer } from '@components/common/RiskDisclaimer';
import { useAuthStore } from '@stores/authStore';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useAuthStore();
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [nickname, setNickname] = useState(user?.nickname || '');
  
  const handleLogout = async () => {
    if (confirm('确定要退出登录吗？')) {
      await logout();
      navigate('/login');
    }
  };
  
  const handleUpdateProfile = async () => {
    try {
      await updateProfile({ nickname });
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Update failed:', error);
    }
  };
  
  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        个人中心
      </Typography>
      
      {/* User Info Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              cursor: 'pointer',
            }}
            onClick={() => setEditDialogOpen(true)}
          >
            <Avatar
              src={user?.avatar}
              sx={{ width: 64, height: 64 }}
            >
              {user?.nickname?.[0] || user?.phone?.[0] || 'U'}
            </Avatar>
            
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={600}>
                {user?.nickname || '未设置昵称'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.phone}
              </Typography>
              <Typography variant="caption" color="primary">
                {user?.vip_level === 'free' ? '免费用户' : 'VIP用户'}
              </Typography>
            </Box>
            
            <Button variant="text" size="small">
              编辑
            </Button>
          </Box>
        </CardContent>
      </Card>
      
      {/* Quick Actions */}
      <Card sx={{ mb: 3 }}>
        <List disablePadding>
          <ListItemButton onClick={() => navigate('/portfolio')}>
            <ListItemIcon>
              <AccountBalanceWallet />
            </ListItemIcon>
            <ListItemText primary="我的持仓" />
          </ListItemButton>
          
          <Divider />
          
          <ListItemButton onClick={() => navigate('/watchlist')}>
            <ListItemIcon>
              <Star />
            </ListItemIcon>
            <ListItemText primary="我的自选" />
          </ListItemButton>
        </List>
      </Card>
      
      {/* Settings */}
      <Card sx={{ mb: 3 }}>
        <List disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <Notifications />
            </ListItemIcon>
            <ListItemText primary="消息通知" />
            <Switch edge="end" />
          </ListItemButton>
          
          <Divider />
          
          <ListItemButton>
            <ListItemIcon>
              <Security />
            </ListItemIcon>
            <ListItemText primary="账号安全" />
          </ListItemButton>
          
          <Divider />
          
          <ListItemButton>
            <ListItemIcon>
              <Help />
            </ListItemIcon>
            <ListItemText primary="帮助中心" />
          </ListItemButton>
          
          <Divider />
          
          <ListItemButton>
            <ListItemIcon>
              <Info />
            </ListItemIcon>
            <ListItemText primary="关于我们" />
          </ListItemButton>
        </List>
      </Card>
      
      {/* Logout */}
      <Button
        variant="outlined"
        color="error"
        fullWidth
        startIcon={<Logout />}
        onClick={handleLogout}
        sx={{ mb: 3 }}
      >
        退出登录
      </Button>
      
      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>编辑资料</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Avatar
              src={user?.avatar}
              sx={{ width: 80, height: 80 }}
            >
              {nickname?.[0] || 'U'}
            </Avatar>
          </Box>
          
          <TextField
            fullWidth
            label="昵称"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleUpdateProfile}>保存</Button>
        </DialogActions>
      </Dialog>
      
      {/* Risk Disclaimer */}
      <Box sx={{ mt: 4 }}>
        <RiskDisclaimer compact />
      </Box>
    </Box>
  );
}
