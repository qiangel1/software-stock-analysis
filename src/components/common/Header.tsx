/**
 * Header Component
 * 
 * Top navigation header with logo, search,
 * and user menu.
 */

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  InputBase,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import {
  Search as SearchIcon,
  Menu as MenuIcon,
  AccountCircle,
  Settings,
  Logout,
  TrendingUp,
} from '@mui/icons-material';
import { useAuthStore } from '@stores/authStore';

const NAV_ITEMS = [
  { label: '首页', path: '/' },
  { label: '自选', path: '/watchlist' },
  { label: '行情', path: '/market' },
  { label: '资讯', path: '/news' },
  { label: '我的', path: '/profile' },
];

/**
 * Header component with navigation and search
 */
export function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = async () => {
    handleMenuClose();
    await logout();
    navigate('/login');
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/stock/${searchValue.trim()}`);
      setSearchValue('');
    }
  };
  
  return (
    <>
      <AppBar 
        position="sticky" 
        color="default"
        sx={{ 
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ gap: 2 }}>
          {/* Logo */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              mr: 2,
            }}
            onClick={() => navigate('/')}
          >
            <TrendingUp sx={{ color: 'primary.main', mr: 1, fontSize: 28 }} />
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700, 
                color: 'primary.main',
                display: { xs: 'none', sm: 'block' },
              }}
            >
              StockQuant
            </Typography>
          </Box>
          
          {/* Search Bar */}
          {!isMobile && (
            <Box
              component="form"
              onSubmit={handleSearch}
              sx={{
                display: 'flex',
                alignItems: 'center',
                bgcolor: 'grey.100',
                borderRadius: 2,
                px: 2,
                py: 0.5,
                flex: 1,
                maxWidth: 400,
              }}
            >
              <SearchIcon sx={{ color: 'grey.500', mr: 1 }} />
              <InputBase
                placeholder="搜索股票代码或名称..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                sx={{ flex: 1 }}
              />
            </Box>
          )}
          
          <Box sx={{ flex: 1 }} />
          
          {/* User Menu */}
          {isAuthenticated ? (
            <>
              <IconButton onClick={handleMenuOpen} size="large">
                <Avatar
                  src={user?.avatar}
                  alt={user?.nickname || '用户'}
                  sx={{ width: 36, height: 36 }}
                >
                  {user?.nickname?.[0] || user?.phone?.[0] || 'U'}
                </Avatar>
              </IconButton>
              
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
                  <ListItemIcon>
                    <AccountCircle fontSize="small" />
                  </ListItemIcon>
                  个人中心
                </MenuItem>
                <MenuItem onClick={() => { handleMenuClose(); navigate('/portfolio'); }}>
                  <ListItemIcon>
                    <TrendingUp fontSize="small" />
                  </ListItemIcon>
                  我的持仓
                </MenuItem>
                <MenuItem onClick={() => { handleMenuClose(); navigate('/settings'); }}>
                  <ListItemIcon>
                    <Settings fontSize="small" />
                  </ListItemIcon>
                  设置
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  退出登录
                </MenuItem>
              </Menu>
            </>
          ) : (
            <IconButton onClick={() => navigate('/login')} size="large">
              <AccountCircle />
            </IconButton>
          )}
          
          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton onClick={() => setDrawerOpen(true)} size="large">
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>
      
      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 280, pt: 2 }}>
          {/* Search */}
          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: 'grey.100',
              borderRadius: 2,
              mx: 2,
              mb: 2,
              px: 2,
              py: 1,
            }}
          >
            <SearchIcon sx={{ color: 'grey.500', mr: 1 }} />
            <InputBase
              placeholder="搜索股票..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              sx={{ flex: 1 }}
            />
          </Box>
          
          {/* Navigation */}
          <List>
            {NAV_ITEMS.map((item) => (
              <ListItemButton
                key={item.path}
                selected={location.pathname === item.path}
                onClick={() => {
                  navigate(item.path);
                  setDrawerOpen(false);
                }}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
