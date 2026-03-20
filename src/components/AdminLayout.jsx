import { useState, useEffect } from "react";
import {
  LogOut, Settings, X, Construction,
  Users, Shield, Plus, Edit, Trash2,
  Check, XCircle, Search, Filter,
  Eye, EyeOff, Copy, Key, UserPlus,
  ChevronRight, AlertCircle, Save,
  ExternalLink, Lock, Unlock, RefreshCw,
  BarChart3, Database, Grid, List, Mail, Phone,
  Award, TrendingUp, Clock, Calendar, MapPin,
  Globe, Factory, Zap, Star, Heart, BookOpen,
  Briefcase, Github, Linkedin, Twitter,
  Instagram, Facebook, Youtube, MessageCircle,
  Send, Mail as MailIcon, Phone as PhoneIcon,
  MapPin as MapPinIcon, Clock as ClockIcon,
  User, CheckCircle2, ClipboardList, Target,
  Home, Settings2, UserCog, LineChart, Activity,
  PieChart, Filter as FilterIcon, Download,
  Upload, ShieldCheck, Server, Wifi, HardDrive,
  Cpu, Monitor, Smartphone, Tablet, Laptop,
  ChevronDown, ChevronUp, Menu, Bell, Search as SearchIcon,
  HelpCircle, LogIn, Camera, Edit2, Map
} from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import HomePage from "../pages/AllUsers";
import { fetchAllEmployees } from "../redux/slice/employee";
import {
  fetchUserApps,
  fetchAllSystems,
  fetchAllUsers,
  createUser,
  updateUser,
  deleteUser
} from "../redux/api/loginApi";
import logo from "../assets/Passary-refractories-logo.png";

// Brand colors matching the olive green Passary logo
const BRAND = {
  primary: "#6B8E23",       // olive green
  primaryLight: "#8CB04E",  // lighter olive
  primaryDark: "#4A5D23",   // darker olive
  accent: "#DAA520",        // golden rod
  surface: "#F5F7F2",       // light olive-tinted surface
  text: "#2C3E50",          // dark slate
  textLight: "#5D6D7E",     // lighter text
  gradient: "linear-gradient(135deg, #4A5D23 0%, #6B8E23 50%, #8CB04E 100%)"
};

// Helper function to get fallback avatar
const getFallbackAvatar = (name = "", size = 128) => {
  let initials = "US";
  if (name) {
    const nameParts = name.split(' ');
    if (nameParts.length >= 2) {
      initials = (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    } else if (nameParts.length === 1 && nameParts[0].length >= 2) {
      initials = nameParts[0].substring(0, 2).toUpperCase();
    }
  }
  return `https://ui-avatars.com/api/?name=${initials}&background=${BRAND.primary.replace('#', '')}&color=fff&size=${size}&bold=true`;
};

function UnderConstruction() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="text-center max-w-2xl">
        <div className="mb-8 relative">
          <Construction className="w-32 h-32 mx-auto animate-bounce" style={{ color: BRAND.primary }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-40 h-40 rounded-full animate-ping opacity-20" style={{ background: BRAND.primary }}></div>
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: BRAND.primaryDark }}>
          Under Construction
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          This module is currently being developed and will be available soon.
        </p>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }) {
  const dispatch = useDispatch();
  const { employees } = useSelector((state) => state.employee);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState("home");
  const [currentUrl, setCurrentUrl] = useState("");
  const [isIframeVisible, setIsIframeVisible] = useState(false);
  const [showUnderConstruction, setShowUnderConstruction] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const navigate = useNavigate();
  const [systems, setSystems] = useState([]);
  const [allApps, setAllApps] = useState([]);
  const [showAdminPanel, setShowAdminPanel] = useState(false); // Changed from popup to panel
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [selectedApps, setSelectedApps] = useState([]);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [selectedUserForAccess, setSelectedUserForAccess] = useState(null);
  const [username, setUsername] = useState(() =>
    localStorage.getItem("user-name")
  );
  const [userRole, setUserRole] = useState(() =>
    localStorage.getItem("role")
  );
  const isAdmin = username?.toLowerCase() === "admin" || userRole?.toLowerCase() === "admin";
  const [isSavingSystem, setIsSavingSystem] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [systemAccessList, setSystemAccessList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]);
  const [showAdminDashboard, setShowAdminDashboard] = useState(isAdmin && activeRoute === "HOME");
  const [settingsView, setSettingsView] = useState("dashboard"); // dashboard, users, systems
  const [userAccessStats, setUserAccessStats] = useState({});
  const [quickStats, setQuickStats] = useState({
    totalUsers: 0,
    totalSystems: 0,
    adminUsers: 0,
    avgAppsPerUser: 0
  });

  const DEFAULT_SYSTEMS = ["CHECKLIST COMBINED"];

  // Add these helper functions
  const getSSOUrl = (baseUrl, appId) => {
    const ssoToken = localStorage.getItem('sso_token');
    const username = localStorage.getItem('user-name');

    if (!ssoToken || !username) {
      return baseUrl;
    }

    const params = new URLSearchParams({
      _sso: ssoToken,
      _user: username,
      _app: appId,
      _ts: Date.now(),
      _src: 'passary_portal',
      _v: '1.0'
    });

    if (appId.includes('FMS')) {
      params.append('_type', 'fms_sso');
      params.append('_action', 'auto_login');
    } else if (appId.includes('MIS')) {
      params.append('_type', 'mis_sso');
      params.append('_redirect', 'dashboard');
    }

    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}${params.toString()}`;
  };

  // Helper to convert Google Drive link to direct image URL
  const getDriveDirectUrl = (url) => {
    if (!url || url.trim() === '') return null;
    const cleanUrl = url.trim();
    if (cleanUrl.startsWith('data:image')) return cleanUrl;
    if (cleanUrl.includes('googleusercontent.com')) return cleanUrl;
    if (cleanUrl.includes('lh3.googleusercontent.com')) return cleanUrl;
    if (cleanUrl.includes('drive.google.com/thumbnail')) return cleanUrl;
    if (cleanUrl.includes('drive.google.com/uc?')) return cleanUrl;

    let fileId = null;
    const patterns = [
      /\/file\/d\/([a-zA-Z0-9_-]{25,})/,
      /\/d\/([a-zA-Z0-9_-]{25,})/,
      /[?&]id=([a-zA-Z0-9_-]{25,})/,
      /\/uc\?id=([a-zA-Z0-9_-]{25,})/,
      /open\?id=([a-zA-Z0-9_-]{25,})/,
    ];
    for (const pattern of patterns) {
      const match = cleanUrl.match(pattern);
      if (match && match[1]) { fileId = match[1]; break; }
    }
    if (fileId) return `https://lh3.googleusercontent.com/d/${fileId}=s200`;
    if (cleanUrl.startsWith('http')) return cleanUrl;
    return null;
  };

  const findEmployeeData = (empCode) => {
    if (!empCode || !employees) return null;
    return employees.find(emp =>
      (emp["Employee Code"] || "").toString().trim().toUpperCase() ===
      empCode.toString().trim().toUpperCase()
    );
  };

  const topNavRoutes = [
    {
      id: "HOME",
      label: "HOME",
      url: "",
    },
    ...systems.map((s) => ({
      id: s.id || s.systems,
      label: s.label || s.name || s.systems,
      url: s.url || s.link || "",
    })),
  ];

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type });
    }, 3000);
  };

  const handleRouteClick = (url, id) => {
    setActiveRoute(id);

    if (id.toUpperCase() === "HOME") {
      setIsIframeVisible(false);
      setShowUnderConstruction(false);
      setCurrentUrl("");
      setShowAdminDashboard(isAdmin);
      return;
    }

    if (!url || url.trim() === "") {
      setShowUnderConstruction(true);
      setIsIframeVisible(false);
      setCurrentUrl("");
      setShowAdminDashboard(false);
    } else {
      const ssoToken = localStorage.getItem('sso_token');
      const username = localStorage.getItem('user-name');

      let authUrl = url;

      if (ssoToken && username) {
        const hasParams = url.includes('?');
        const separator = hasParams ? '&' : '?';
        authUrl = `${url}${separator}_sso=${encodeURIComponent(ssoToken)}&_user=${encodeURIComponent(username)}&_source=master_portal&_time=${Date.now()}`;

        if (id.includes('APP')) {
          authUrl += '&auto_login=true';
          if (id.includes('FMS')) {
            authUrl += '&redirect=dashboard&mode=sso';
          } else if (id.includes('MIS')) {
            authUrl += '&auth_type=token&auto_redirect=true';
          }
        }
      }

      setCurrentUrl(authUrl);
      setIsIframeVisible(true);
      setShowUnderConstruction(false);
      setShowAdminDashboard(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user-name");
    localStorage.removeItem("role");
    localStorage.removeItem("email_id");
    localStorage.removeItem("system_access");
    localStorage.removeItem("user-apps");
    localStorage.removeItem("activeRoute");
    localStorage.removeItem("currentUrl");
    sessionStorage.clear();

    window.location.replace("/login");
  };

  // Load systems
  const loadSystems = async () => {
    try {
      const username = localStorage.getItem("user-name");

      if (!username) {
        navigate("/login", { replace: true });
        return;
      }

      if (isAdmin) {
        try {
          const allAppsData = await fetchAllSystems();
          setAllApps(allAppsData);
        } catch (error) {
          // failed to load apps
        }
      }

      const accessibleAppIds = JSON.parse(localStorage.getItem("accessibleAppIds") || "[]");
      let userApps = [];

      try {
        userApps = await fetchUserApps(username);
      } catch (fetchError) {
        // Could not fetch user apps
      }

      if (userApps.length === 0 && accessibleAppIds.length > 0) {
        userApps = accessibleAppIds.map(appId => ({
          id: appId,
          name: appId.replace('APP', 'App '),
          url: `https://${appId.toLowerCase()}.example.com`,
          label: appId.replace('APP', 'App ')
        }));
      }

      setSystems(userApps);
      setSystemAccessList(userApps.map(app => app.id));

    } catch (error) {
      showToast("Failed to load systems", "error");
    }
  };

  // Load all users and calculate stats
  const loadAllUsers = async () => {
    try {
      if (!isAdmin) return;

      const users = await fetchAllUsers();
      setAllUsers(users);

      const stats = {};
      users.forEach(user => {
        const accessibleApps = user.accessibleApps || 0;
        stats[user.username] = {
          accessibleApps,
          systems: []
        };

        for (let i = 1; i <= 16; i++) {
          const appKey = `APP${i.toString().padStart(2, '0')}`;
          if (user[appKey]?.toLowerCase() === 'yes') {
            const appInfo = allApps.find(app => app.id === appKey);
            if (appInfo) {
              stats[user.username].systems.push(appInfo.name || appKey);
            }
          }
        }
      });

      setUserAccessStats(stats);

      const totalUsers = users.length;
      const adminUsers = users.filter(u => u.role?.toLowerCase() === 'admin').length;
      const totalAccessibleApps = users.reduce((sum, user) => sum + (user.accessibleApps || 0), 0);
      const avgAppsPerUser = totalUsers > 0 ? (totalAccessibleApps / totalUsers).toFixed(1) : 0;

      setQuickStats({
        totalUsers,
        totalSystems: allApps.length,
        adminUsers,
        avgAppsPerUser
      });

    } catch (error) {
      showToast("Failed to load users", "error");
    }
  };

  // Handle create user
  const handleSaveUser = async (userData) => {
    try {
      setIsSavingSystem(true);

      if (editingUser) {
        await updateUser(editingUser.username || editingUser.id, userData);
        showToast("User updated successfully");
      } else {
        await createUser(userData, "https://script.google.com/macros/s/AKfycbwLVsUjSId4P8R_ewx4YIYLf7Hr44js9rgoXsvl58hI66VUZjQPhfT7XW9UQnGRkS0U/exec");
        showToast("User created successfully");
      }

      await loadAllUsers();
      setShowUserModal(false);
      setEditingUser(null);
      setSelectedApps([]);

    } catch (error) {
      let errorMessage = "Failed to save user";
      if (error.message.includes("network") || error.message.includes("NetworkError")) {
        errorMessage = "Network error. Please check your connection.";
      } else if (error.message.includes("not found")) {
        errorMessage = "User not found or sheet access error";
      } else if (error.message.includes("Failed to fetch")) {
        errorMessage = "Cannot connect to Google Sheets. Please check the script URL.";
      } else if (error.message.includes("ReferenceError")) {
        errorMessage = "Configuration error. Please contact administrator.";
      }
      showToast(errorMessage, "error");
    } finally {
      setIsSavingSystem(false);
    }
  };

  // Handle delete user
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await deleteUser(userId);
      showToast("User deleted successfully");
      await loadAllUsers();
    } catch (error) {
      showToast("Failed to delete user", "error");
    }
  };

  // Handle app selection
  const handleAppSelection = (appId) => {
    setSelectedApps(prev => {
      if (prev.includes(appId)) {
        return prev.filter(id => id !== appId);
      } else {
        return [...prev, appId];
      }
    });
  };

  // Handle assign access
  const handleAssignAccess = async () => {
    if (!selectedUserForAccess) return;

    try {
      await updateUser(selectedUserForAccess.username, {
        system_access: JSON.stringify(selectedApps)
      });

      showToast("Access updated successfully");
      setShowAccessModal(false);
      setSelectedUserForAccess(null);
      setSelectedApps([]);
      await loadAllUsers();

    } catch (error) {
      showToast("Failed to update access", "error");
    }
  };

  // Refresh all data
  const refreshData = async () => {
    setLoading(true);
    try {
      await loadSystems();
      await loadAllUsers();
      showToast("Data refreshed successfully");
    } catch (error) {
      showToast("Failed to refresh data", "error");
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await loadSystems();
      if (isAdmin) {
        await loadAllUsers();
        await dispatch(fetchAllEmployees()).unwrap();
      }
      setLoading(false);
    };

    loadInitialData();
  }, [dispatch, isAdmin]);

  useEffect(() => {
    if (selectedUserForAccess && selectedUserForAccess.username) {
      const userStats = userAccessStats[selectedUserForAccess.username];
      if (userStats) {
        const userAppIds = userStats.systems.map(sysName => {
          const app = allApps.find(a => a.name === sysName);
          return app ? app.id : null;
        }).filter(id => id !== null);

        setSelectedApps(userAppIds);
      }
    }
  }, [selectedUserForAccess, userAccessStats, allApps]);

  useEffect(() => {
    const savedRoute = localStorage.getItem("activeRoute");
    const savedUrl = localStorage.getItem("currentUrl");

    if (savedRoute) setActiveRoute(savedRoute);
    if (savedUrl) {
      setCurrentUrl(savedUrl);
      setIsIframeVisible(!!savedUrl);
      setShowAdminDashboard(false);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("activeRoute", activeRoute);
    localStorage.setItem("currentUrl", currentUrl);
  }, [activeRoute, currentUrl]);

  useEffect(() => {
    if (!username) {
      navigate("/login", { replace: true });
    }
  }, [username, navigate]);

  const getButtonClass = (routeId) => {
    return `px-4 py-3 text-sm font-medium whitespace-nowrap hover:bg-white/20 transition-all border-r border-white/10 ${activeRoute === routeId ? "bg-white/25 shadow-lg font-bold" : ""
      }`;
  };

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        setIsHeaderVisible(false);
      } else {
        setIsHeaderVisible(true);
      }
      lastScrollY = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Filter users
  const filteredUsers = allUsers.filter(user => {
    const matchesSearch =
      (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.employee_code && user.employee_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.department && user.department.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = filterRole === "all" ||
      (user.role && user.role.toLowerCase() === filterRole.toLowerCase());

    return matchesSearch && matchesRole;
  });

  // Compact Stat Card Component
  const CompactStatCard = ({ icon: Icon, label, value, color = BRAND.primary, bgColor = `${BRAND.primary}15` }) => (
    <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 flex items-center gap-3">
      <div className="p-2 rounded-lg flex-shrink-0" style={{ background: bgColor }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        <p className="text-lg font-bold leading-none" style={{ color }}>{value}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: BRAND.surface }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-transparent mx-auto" style={{ borderColor: BRAND.primary, borderTopColor: 'transparent' }}></div>
          <p className="mt-4 font-medium" style={{ color: BRAND.primary }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: BRAND.surface }}>
      {/* Header */}
      <header
        className={`bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm transition-transform duration-300 ${isHeaderVisible ? "translate-y-0" : "-translate-y-full"
          }`}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Passary Refractories" className="h-10 w-auto" />
            <div className="hidden md:block">
              <h1 className="text-lg font-bold" style={{ color: BRAND.primaryDark }}>Passary Refractories</h1>
              <p className="text-xs" style={{ color: BRAND.primary }}>Employee Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-700 font-medium text-sm">
                Welcome, {username || "User"}
              </span>
              {userRole && (
                <span className="text-xs px-2 py-1 rounded-full font-semibold text-white" style={{ background: BRAND.primary }}>
                  {userRole}
                </span>
              )}
            </div>

            {/* Admin Panel Toggle Button */}
            {isAdmin && (
              <button
                onClick={() => setShowAdminPanel(!showAdminPanel)}
                className="relative w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition shadow-md hover:shadow-lg"
                style={{ background: showAdminPanel ? BRAND.primary : BRAND.gradient }}
                title="Admin Control Panel"
              >
                <Settings className="text-white w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center border-2 border-white">
                  {quickStats.totalUsers}
                </span>
              </button>
            )}

            <div
              onClick={handleLogout}
              className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition hover:shadow-md"
              style={{ background: `${BRAND.primary}15` }}
            >
              <LogOut className="w-5 h-5" style={{ color: BRAND.primary }} />
            </div>
          </div>
        </div>
      </header>

      {/* Top Navigation Bar */}
      <nav className="text-white sticky top-[64px] z-40 shadow-lg" style={{ background: BRAND.gradient }}>
        <div className="flex items-center overflow-x-auto scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-white/10">
          {topNavRoutes
            .filter((route) => {
              const routeId = route.id.toUpperCase();
              if (isAdmin) return true;
              if (routeId === "HOME") return true;
              if (DEFAULT_SYSTEMS.includes(routeId)) return true;
              return systemAccessList.includes(routeId);
            })
            .map((route) => (
              <button
                key={route.id}
                onClick={() => handleRouteClick(route.url, route.id)}
                className={getButtonClass(route.id)}
              >
                {route.label}
              </button>
            ))}
        </div>
      </nav>

      {/* Admin Panel - Compact View at Top (Before Welcome Section) */}
      {showAdminPanel && isAdmin && (
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            {/* Header with Tabs */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${BRAND.primary}15` }}>
                  <Settings className="w-4 h-4" style={{ color: BRAND.primary }} />
                </div>
                <h2 className="text-lg font-bold" style={{ color: BRAND.primaryDark }}>Admin Control Panel</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={refreshData}
                  className="p-2 rounded-lg hover:bg-gray-100 transition"
                  title="Refresh Data"
                >
                  <RefreshCw className="w-4 h-4" style={{ color: BRAND.primary }} />
                </button>
                <button
                  onClick={() => setShowAdminPanel(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Compact Tabs */}
            <div className="flex gap-2 mb-4">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                { id: 'users', label: 'Users', icon: Users },
                { id: 'systems', label: 'Systems', icon: Database }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = settingsView === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSettingsView(tab.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 text-sm ${isActive
                      ? 'text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    style={isActive ? { background: BRAND.gradient } : {}}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {tab.id === 'users' && (
                      <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}`}>
                        {quickStats.totalUsers}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Dashboard View - Compact Stats Grid */}
            {settingsView === "dashboard" && (
              <div className="space-y-4">
                {/* Stats Grid - 4 columns */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <CompactStatCard
                    icon={Users}
                    label="Total Users"
                    value={quickStats.totalUsers}
                    color={BRAND.primary}
                  />
                  <CompactStatCard
                    icon={Database}
                    label="Total Systems"
                    value={quickStats.totalSystems}
                    color="#3b82f6"
                    bgColor="#eef2ff"
                  />
                  <CompactStatCard
                    icon={Shield}
                    label="Admin Users"
                    value={quickStats.adminUsers}
                    color="#8b5cf6"
                    bgColor="#f5f3ff"
                  />
                  <CompactStatCard
                    icon={Target}
                    label="Avg Apps/User"
                    value={quickStats.avgAppsPerUser}
                    color={BRAND.accent}
                    bgColor={`${BRAND.accent}15`}
                  />
                </div>

                {/* Quick Actions - Horizontal */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSettingsView("users");
                      setShowUserModal(true);
                    }}
                    className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition text-sm"
                  >
                    <UserPlus className="w-4 h-4" style={{ color: BRAND.primary }} />
                    <span>Add User</span>
                  </button>
                  <button
                    onClick={() => setSettingsView("systems")}
                    className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition text-sm"
                  >
                    <Database className="w-4 h-4" style={{ color: BRAND.primary }} />
                    <span>View Systems</span>
                  </button>
                  <span className="text-xs text-gray-500 ml-auto">
                    Last updated: {new Date().toLocaleTimeString()}
                  </span>
                </div>

                {/* Recent Users - Compact List */}
                <div>
                  <h3 className="text-sm font-semibold mb-2" style={{ color: BRAND.primaryDark }}>Recent Users</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {allUsers.slice(0, 3).map(user => {
                      const empD = findEmployeeData(user.employee_code || user.username);
                      const photoUrl = empD ? getDriveDirectUrl(empD["Candidate's Photo"] || empD.photo || '') : null;
                      const appCount = userAccessStats[user.username]?.accessibleApps || 0;
                      return (
                        <div key={user.username} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full overflow-hidden border" style={{ borderColor: BRAND.primary }}>
                              <img
                                src={photoUrl || getFallbackAvatar(user.name, 32)}
                                alt={user.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = getFallbackAvatar(user.name, 32);
                                }}
                              />
                            </div>
                            <div>
                              <p className="text-xs font-semibold">{user.name}</p>
                              <p className="text-xs text-gray-500">{appCount} apps</p>
                            </div>
                          </div>
                          <button
                            onClick={() => { setSelectedUserForAccess(user); setShowAccessModal(true); }}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <Edit2 className="w-3 h-3" style={{ color: BRAND.primary }} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Users View - Compact Table */}
            {settingsView === "users" && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="relative flex-1 max-w-xs">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                    <option value="hr">HR</option>
                    <option value="store">Store</option>
                    <option value="accounts">Accounts</option>
                  </select>
                  <button
                    onClick={() => {
                      setEditingUser(null);
                      setShowUserModal(true);
                    }}
                    className="px-3 py-2 text-white rounded-lg text-sm flex items-center gap-2"
                    style={{ background: BRAND.gradient }}
                  >
                    <UserPlus className="w-4 h-4" />
                    Add
                  </button>
                </div>

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: BRAND.gradient }}>
                        <th className="px-3 py-2 text-left text-xs text-white">User</th>
                        <th className="px-3 py-2 text-left text-xs text-white">Role</th>
                        <th className="px-3 py-2 text-left text-xs text-white">Access</th>
                        <th className="px-3 py-2 text-left text-xs text-white">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredUsers.slice(0, 5).map(user => (
                        <tr key={user.username} className="hover:bg-gray-50">
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full overflow-hidden border" style={{ borderColor: BRAND.primary }}>
                                <img
                                  src={getFallbackAvatar(user.name, 24)}
                                  alt={user.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <p className="font-medium text-xs">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.username}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ background: `${BRAND.primary}15`, color: BRAND.primary }}>
                              {user.role || 'user'}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <span className="font-semibold" style={{ color: BRAND.primary }}>
                              {userAccessStats[user.username]?.accessibleApps || 0}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => { setEditingUser(user); setShowUserModal(true); }}
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                <Edit className="w-3 h-3" style={{ color: BRAND.primary }} />
                              </button>
                              <button
                                onClick={() => { setSelectedUserForAccess(user); setShowAccessModal(true); }}
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                <Settings className="w-3 h-3" style={{ color: BRAND.primary }} />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.username)}
                                className="p-1 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="w-3 h-3 text-red-500" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredUsers.length > 5 && (
                    <div className="p-2 text-center border-t">
                      <button className="text-xs font-medium" style={{ color: BRAND.primary }}>
                        View all {filteredUsers.length} users
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Systems View - Compact Grid */}
            {settingsView === "systems" && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {allApps.slice(0, 4).map(app => (
                  <div key={app.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Database className="w-3 h-3" style={{ color: BRAND.primary }} />
                      <span className="text-xs font-medium truncate">{app.label || app.name}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{app.url}</p>
                  </div>
                ))}
                {allApps.length > 4 && (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
                    <span className="text-xs font-medium" style={{ color: BRAND.primary }}>
                      +{allApps.length - 4} more
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {isAdmin && showAdminDashboard && (
            <div className="p-4">
              <div className="max-w-7xl mx-auto">
                <HomePage />
              </div>
            </div>
          )}

          {(!isAdmin || !showAdminDashboard) && !isIframeVisible && !showUnderConstruction && <HomePage />}
          {showUnderConstruction && <UnderConstruction />}
          {isIframeVisible && currentUrl && (
            <div className="h-full flex flex-col">
              <div className="flex-1 relative">
                {/* Loading indicator */}
                <div id="iframe-loader" className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent mx-auto" style={{ borderColor: BRAND.primary, borderTopColor: 'transparent' }}></div>
                    <p className="mt-2 text-sm font-medium" style={{ color: BRAND.primary }}>Loading application...</p>
                    <p className="text-xs text-gray-500 mt-1">Auto-login in progress...</p>
                  </div>
                </div>

                <iframe
                  id="external-iframe"
                  src={currentUrl}
                  className="w-full h-full border-0"
                  title="External Content"
                  allow="*"
                  allowFullScreen
                  onLoad={() => {
                    document.getElementById('iframe-loader').style.display = 'none';
                  }}
                  onError={() => {
                    document.getElementById('iframe-loader').style.display = 'none';
                    showToast('Failed to load application', 'error');
                  }}
                />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[110] p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-200" style={{ background: BRAND.gradient }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    {editingUser ? <Edit className="w-4 h-4 text-white" /> : <UserPlus className="w-4 h-4 text-white" />}
                  </div>
                  <h2 className="text-lg font-bold text-white">
                    {editingUser ? "Edit User" : "Create New User"}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setShowUserModal(false);
                    setEditingUser(null);
                  }}
                  className="p-1 hover:bg-white/20 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const userData = {
                    employee_code: formData.get('employee_code'),
                    name: formData.get('name'),
                    username: formData.get('username'),
                    password: formData.get('password'),
                    role: formData.get('role'),
                    department: formData.get('department'),
                    status: 'active'
                  };
                  handleSaveUser(userData);
                }}
              >
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Employee Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="employee_code"
                      defaultValue={editingUser?.employee_code}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      placeholder="e.g., PMMPL-1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={editingUser?.name}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      placeholder="e.g., John Doe"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="username"
                      defaultValue={editingUser?.username}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      placeholder="e.g., john.doe"
                      required
                      disabled={!!editingUser}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Password {!editingUser && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm pr-10"
                        placeholder={editingUser ? "Leave blank to keep unchanged" : "Enter password"}
                        required={!editingUser}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Role <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="role"
                        defaultValue={editingUser?.role || 'user'}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="hr">HR</option>
                        <option value="store">Store</option>
                        <option value="accounts">Accounts</option>
                        <option value="manager">Manager</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Department
                      </label>
                      <input
                        type="text"
                        name="department"
                        defaultValue={editingUser?.department}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        placeholder="e.g., HR"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserModal(false);
                      setEditingUser(null);
                    }}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingSystem}
                    className="px-4 py-2 text-white rounded-lg text-sm hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                    style={{ background: BRAND.gradient }}
                  >
                    {isSavingSystem ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : editingUser ? (
                      <>
                        <Save className="w-4 h-4" />
                        Update
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        Create
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Access Modal */}
      {showAccessModal && selectedUserForAccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[110] p-4">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-200" style={{ background: BRAND.gradient }}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    System Access
                  </h2>
                  <p className="text-green-100 text-xs mt-1">
                    {selectedUserForAccess.name} • {userAccessStats[selectedUserForAccess.username]?.accessibleApps || 0} systems
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowAccessModal(false);
                    setSelectedUserForAccess(null);
                  }}
                  className="p-1 hover:bg-white/20 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {allApps.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => handleAppSelection(app.id)}
                    className={`p-2 border rounded-lg cursor-pointer transition text-sm ${selectedApps.includes(app.id)
                      ? "border-2"
                      : "border-gray-200 hover:border-gray-300"
                      }`}
                    style={selectedApps.includes(app.id) ? { borderColor: BRAND.primary, background: `${BRAND.primary}10` } : {}}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center ${selectedApps.includes(app.id) ? "text-white" : "bg-white border-gray-300"}`}
                        style={selectedApps.includes(app.id) ? { background: BRAND.primary, borderColor: BRAND.primary } : {}}
                      >
                        {selectedApps.includes(app.id) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-xs truncate">{app.label || app.name}</div>
                        <div className="text-xs text-gray-500 truncate">{app.url}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">
                  Selected: <span className="font-semibold" style={{ color: BRAND.primary }}>{selectedApps.length} systems</span>
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowAccessModal(false);
                      setSelectedUserForAccess(null);
                    }}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAssignAccess}
                    disabled={isSavingSystem}
                    className="px-4 py-2 text-white rounded-lg text-sm hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                    style={{ background: BRAND.gradient }}
                  >
                    {isSavingSystem ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Save
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div
          className="fixed top-5 right-5 z-[9999] px-4 py-3 rounded-lg shadow-lg text-white text-sm flex items-center gap-2 animate-slide-in-right"
          style={{ background: toast.type === "success" ? BRAND.primary : '#ef4444' }}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          {toast.message}
        </div>
      )}
    </div>
  );
}