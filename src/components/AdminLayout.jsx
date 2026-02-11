import { useState, useEffect } from "react";
import {
  LogOut, Settings, X, Construction,
  Users, Shield, Plus, Edit, Trash2,
  Check, XCircle, Search, Filter,
  Eye, EyeOff, Copy, Key, UserPlus,
  ChevronRight, AlertCircle, Save,
  ExternalLink, Lock, Unlock, RefreshCw,
  BarChart3, Database, Grid, List
} from 'lucide-react';
import { useNavigate } from "react-router-dom";
import HomePage from "../pages/AllUsers";
import {
  fetchUserApps,
  fetchAllSystems,
  fetchAllUsers,
  createUser,
  updateUser,
  deleteUser
} from "../redux/api/loginApi";
import logo from "../assets/logo.png";
import { getSSOUrl, clearSSOToken } from "../services/ssoService";
import { listenForSSOMessages } from "../utils/ssoIframeHandler";

function UnderConstruction() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="text-center max-w-2xl">
        <div className="mb-8 relative">
          <Construction className="w-32 h-32 mx-auto text-sky-500 animate-bounce" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-40 h-40 bg-sky-100 rounded-full animate-ping opacity-20"></div>
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState("home");
  const [currentUrl, setCurrentUrl] = useState("");
  const [isIframeVisible, setIsIframeVisible] = useState(false);
  const [showUnderConstruction, setShowUnderConstruction] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const navigate = useNavigate();
  const [systems, setSystems] = useState([]);
  const [allApps, setAllApps] = useState([]);
  const [showSettingsPopup, setShowSettingsPopup] = useState(false);
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

  // Add these helper functions in AdminLayout.jsx
  const getSSOUrl = (baseUrl, appId) => {
    const ssoToken = localStorage.getItem('sso_token');
    const username = localStorage.getItem('user-name');

    if (!ssoToken || !username) {
      return baseUrl;
    }

    // Create app-specific parameters
    const params = new URLSearchParams({
      _sso: ssoToken,
      _user: username,
      _app: appId,
      _ts: Date.now(),
      _src: 'passary_portal',
      _v: '1.0'
    });

    // Add specific parameters based on app type
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

  const simulateAutoLogin = (appId, appUrl) => {
    // This function attempts to auto-login by modifying the iframe src
    const ssoUrl = getSSOUrl(appUrl, appId);

    // Check if this is a known app pattern
    const knownApps = {
      'FMS': {
        loginField: 'username',
        passwordField: 'password',
        submitButton: 'input[type="submit"], button[type="submit"]'
      },
      'MIS': {
        loginField: 'email',
        passwordField: 'password',
        submitButton: '.login-btn, #login-button'
      }
    };

    // Return enhanced URL with hints
    return ssoUrl;
  }; const topNavRoutes = [
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

  // AdminLayout.jsx - Update handleRouteClick function
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
      // ========== ENHANCED SSO URL GENERATION ==========
      // Use SSO service to generate authenticated URL
      const authUrl = getSSOUrl(url, id);

      console.log(`🔐 Navigating to ${id} with SSO authentication`);
      // ========== END SSO MODIFICATIONS ==========

      setCurrentUrl(authUrl);
      setIsIframeVisible(true);
      setShowUnderConstruction(false);
      setShowAdminDashboard(false);
    }
  };


  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem("user-name");
    localStorage.removeItem("role");
    localStorage.removeItem("email_id");
    localStorage.removeItem("system_access");
    localStorage.removeItem("user-apps");
    localStorage.removeItem("activeRoute");
    localStorage.removeItem("currentUrl");

    // Clear SSO tokens using service
    clearSSOToken();

    sessionStorage.clear();

    window.location.replace("/login");
  };

  // Initialize SSO message listener for iframe communication
  useEffect(() => {
    const cleanup = listenForSSOMessages((message) => {
      if (message.success) {
        console.log(`✅ SSO login successful in ${message.appId || 'application'}`);
        showToast(`Auto-login successful in ${message.appId || 'application'}`, "success");
      } else {
        console.warn(`⚠️ SSO login failed: ${message.error}`);
        // Don't show error toast to avoid overwhelming user
      }
    });

    return cleanup; // Cleanup on unmount
  }, []);

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
          console.error("Error loading all apps:", error);
        }
      }

      const accessibleAppIds = JSON.parse(localStorage.getItem("accessibleAppIds") || "[]");
      let userApps = [];

      try {
        userApps = await fetchUserApps(username);
      } catch (fetchError) {
        console.log("Could not fetch user apps from API:", fetchError);
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
      console.error("Error loading systems:", error);
      showToast("Failed to load systems", "error");
    }
  };
  // In your loadSystems function or after fetching systems
  const enhancedSystems = systems.map(system => ({
    ...system,
    ssoUrl: getSSOUrl(system.url, system.id),
    autoLogin: true
  }));

  // Use enhancedSystems instead of systems for navigation
  // Load all users and calculate stats
  const loadAllUsers = async () => {
    try {
      if (!isAdmin) return;

      const users = await fetchAllUsers();
      setAllUsers(users);

      // Calculate user access stats
      const stats = {};
      users.forEach(user => {
        const accessibleApps = user.accessibleApps || 0;
        stats[user.username] = {
          accessibleApps,
          systems: []
        };

        // Get which specific apps they have access to
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

      // Calculate quick stats
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
      console.error("Error loading users:", error);
      showToast("Failed to load users", "error");
    }
  };

  // Handle create user
  // In your AdminLayout.jsx, update the handleSaveUser function:
  // In your handleSaveUser function, fix the createUser call:
  const handleSaveUser = async (userData) => {
    try {
      setIsSavingSystem(true);

      if (editingUser) {
        await updateUser(editingUser.username || editingUser.id, userData);
        showToast("User updated successfully");
      } else {
        // Fix: Pass the actual Google Apps Script URL directly
        await createUser(userData, "https://script.google.com/macros/s/AKfycbwLVsUjSId4P8R_ewx4YIYLf7Hr44js9rgoXsvl58hI66VUZjQPhfT7XW9UQnGRkS0U/exec");
        showToast("User created successfully");
      }

      // Refresh data
      await loadAllUsers();

      // Close modal and reset
      setShowUserModal(false);
      setEditingUser(null);
      setSelectedApps([]);

    } catch (error) {
      console.error("Error saving user:", error);

      // Show specific error messages
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
      console.error("Error deleting user:", error);
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
      console.error("Error updating access:", error);
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
      console.error("Error refreshing data:", error);
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
      }
      setLoading(false);
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedUserForAccess && selectedUserForAccess.username) {
      const userStats = userAccessStats[selectedUserForAccess.username];
      if (userStats) {
        // Convert system names to app IDs
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
    return `px-4 py-3 text-sm font-medium whitespace-nowrap hover:bg-white/20 transition-all border-r border-white/10 ${activeRoute === routeId ? "bg-gradient-to-r from-sky-400 to-blue-600 shadow-lg" : ""
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

  // Settings Popup Component
  const SettingsPopup = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-5xl rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-sky-900 to-blue-800 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Admin Control Panel</h2>
                <p className="text-sky-100">Manage users, systems, and access permissions</p>
              </div>
            </div>
            <button
              onClick={() => setShowSettingsPopup(false)}
              className="p-2 hover:bg-white/20 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="mt-4 flex space-x-1">
            <button
              onClick={() => setSettingsView("dashboard")}
              className={`px-4 py-2 rounded-t-lg font-medium transition ${settingsView === "dashboard"
                ? "bg-white text-sky-900"
                : "text-sky-200 hover:text-white hover:bg-white/10"
                }`}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </div>
            </button>
            <button
              onClick={() => setSettingsView("users")}
              className={`px-4 py-2 rounded-t-lg font-medium transition ${settingsView === "users"
                ? "bg-white text-sky-900"
                : "text-sky-200 hover:text-white hover:bg-white/10"
                }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Users ({quickStats.totalUsers})
              </div>
            </button>
            <button
              onClick={() => setSettingsView("systems")}
              className={`px-4 py-2 rounded-t-lg font-medium transition ${settingsView === "systems"
                ? "bg-white text-sky-900"
                : "text-sky-200 hover:text-white hover:bg-white/10"
                }`}
            >
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                Systems ({quickStats.totalSystems})
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto">
          {/* Dashboard View */}
          {settingsView === "dashboard" && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl p-5 border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Users</p>
                      <p className="text-3xl font-bold text-gray-900">{quickStats.totalUsers}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Registered in system
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Systems</p>
                      <p className="text-3xl font-bold text-gray-900">{quickStats.totalSystems}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <Database className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Available applications
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-5 border border-purple-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Admin Users</p>
                      <p className="text-3xl font-bold text-gray-900">{quickStats.adminUsers}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    With admin privileges
                  </p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-5 border border-orange-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Avg Apps/User</p>
                      <p className="text-3xl font-bold text-gray-900">{quickStats.avgAppsPerUser}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                      <Grid className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Average systems per user
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-5 border border-gray-200 mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={() => {
                      setSettingsView("users");
                      setShowUserModal(true);
                    }}
                    className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-sky-300 hover:shadow transition"
                  >
                    <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center">
                      <UserPlus className="w-5 h-5 text-sky-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Add New User</p>
                      <p className="text-xs text-gray-500">Create new user account</p>
                    </div>
                  </button>

                  <button
                    onClick={refreshData}
                    className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-green-300 hover:shadow transition"
                  >
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Refresh Data</p>
                      <p className="text-xs text-gray-500">Update from Google Sheets</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setSettingsView("systems")}
                    className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow transition"
                  >
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Database className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">View All Systems</p>
                      <p className="text-xs text-gray-500">{allApps.length} applications</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Users</h3>
                <div className="space-y-3">
                  {allUsers.slice(0, 5).map(user => (
                    <div key={user.username} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-sky-100 to-blue-100 flex items-center justify-center">
                          <span className="font-bold text-sky-600">
                            {user.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.department} • {user.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                            {userAccessStats[user.username]?.accessibleApps || 0} apps
                          </span>
                          <button
                            onClick={() => {
                              setSelectedUserForAccess(user);
                              setShowAccessModal(true);
                            }}
                            className="text-sky-600 hover:text-sky-800"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Users View */}
          {settingsView === "users" && (
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">User Management</h3>
                  <p className="text-gray-600">Manage user accounts and permissions</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select
                    className="px-4 py-2 border rounded-lg"
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
                    className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Add User
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee Code
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Username
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Apps Access
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsers.map((user) => {
                      const userStats = userAccessStats[user.username] || { accessibleApps: 0, systems: [] };

                      return (
                        <tr key={user.username} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                              {user.employee_code || "N/A"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium">{user.name || "N/A"}</div>
                            <div className="text-xs text-gray-500">{user.department || "N/A"}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium">{user.username}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${user.role?.toLowerCase() === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : user.role?.toLowerCase() === 'hr'
                                ? 'bg-pink-100 text-pink-800'
                                : user.role?.toLowerCase() === 'store'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                              {user.role || 'User'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{userStats.accessibleApps}</span>
                              {userStats.accessibleApps > 0 && (
                                <button
                                  onClick={() => {
                                    setSelectedUserForAccess(user);
                                    setShowAccessModal(true);
                                  }}
                                  className="text-xs text-sky-600 hover:text-sky-800 flex items-center gap-1"
                                >
                                  <Eye className="w-3 h-3" />
                                  View
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedUserForAccess(user);
                                  setShowAccessModal(true);
                                }}
                                className="p-1.5 text-sky-600 hover:bg-sky-50 rounded"
                                title="Manage Access"
                              >
                                <Settings className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingUser(user);
                                  setShowUserModal(true);
                                }}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                title="Edit User"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.username)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                title="Delete User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Systems View */}
          {settingsView === "systems" && (
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900">Available Systems</h3>
                <p className="text-gray-600">{allApps.length} applications available for assignment</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allApps.map((app) => {
                  const usersWithAccess = allUsers.filter(user => {
                    for (let i = 1; i <= 16; i++) {
                      const appKey = `APP${i.toString().padStart(2, '0')}`;
                      if (appKey === app.id && user[appKey]?.toLowerCase() === 'yes') {
                        return true;
                      }
                    }
                    return false;
                  });

                  return (
                    <div key={app.id} className="border rounded-lg p-4 hover:border-sky-300 hover:shadow transition">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-sky-100 to-blue-100 flex items-center justify-center">
                            <Database className="w-5 h-5 text-sky-600" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">{app.label}</h4>
                            <p className="text-xs text-gray-500">{app.id}</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                          {usersWithAccess.length} users
                        </span>
                      </div>

                      <a
                        href={app.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-sky-600 hover:text-sky-800 mb-3 inline-flex items-center gap-1"
                      >
                        {app.url.length > 30 ? `${app.url.substring(0, 30)}...` : app.url}
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      {usersWithAccess.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs text-gray-500 mb-2">Users with access:</p>
                          <div className="flex flex-wrap gap-1">
                            {usersWithAccess.slice(0, 3).map(user => (
                              <span key={user.username} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                {user.name}
                              </span>
                            ))}
                            {usersWithAccess.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                +{usersWithAccess.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={refreshData}
                className="px-4 py-2 text-sky-600 hover:text-sky-800 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={() => setShowSettingsPopup(false)}
                className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-600"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      {/* Header */}
      <header
        className={`bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm transition-transform duration-300 ${isHeaderVisible ? "translate-y-0" : "-translate-y-full"
          }`}
      >
        <div className="flex items-center justify-between px-4 py-5">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Passary Refractories" className="h-10 w-auto" />
            <div className="hidden md:block">
              <h1 className="text-lg font-bold text-gray-900">Passary Refractories</h1>
              <p className="text-xs text-gray-600">Engineering Refractory Excellence Since 1990</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-700 font-medium text-sm">
                Welcome, {username || "User"}
              </span>
              {userRole && (
                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                  {userRole}
                </span>
              )}
            </div>

            {/* Settings Button (Replaces WhatsApp icon) */}
            {isAdmin && (
              <button
                onClick={() => setShowSettingsPopup(true)}
                className="relative w-10 h-10 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 rounded-full flex items-center justify-center cursor-pointer transition shadow-lg"
                title="Admin Settings"
              >
                <Settings className="text-white w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                  {quickStats.totalUsers}
                </span>
              </button>
            )}

            <div
              onClick={handleLogout}
              className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center cursor-pointer transition"
            >
              <LogOut className="text-gray-600 w-5 h-5" />
            </div>
          </div>
        </div>
      </header>

      {/* Top Navigation Bar */}
      <nav className="bg-gradient-to-r from-sky-900 via-blue-600 to-sky-500 text-white sticky top-[64px] z-40 shadow-lg">
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

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-white">
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
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-sm text-gray-600">Loading application...</p>
                    <p className="text-xs text-gray-400 mt-1">Auto-login in progress...</p>
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
                    // Hide loader when iframe loads
                    document.getElementById('iframe-loader').style.display = 'none';

                    // Try to inject auto-login script
                    setTimeout(() => {
                      try {
                        const iframe = document.getElementById('external-iframe');
                        const ssoToken = localStorage.getItem('sso_token');
                        const username = localStorage.getItem('user-name');

                        if (iframe && ssoToken && username) {
                          // This is a simple injection attempt
                          console.log('Injecting SSO data into iframe...');
                        }
                      } catch (e) {
                        console.log('SSO injection not possible (cross-origin)');
                      }
                    }, 1000);
                  }}
                  onError={() => {
                    document.getElementById('iframe-loader').style.display = 'none';
                    showToast('Failed to load application', 'error');
                  }}
                />

                {/* Hidden form for auto-submit (fallback) */}
                <form
                  id="sso-auto-form"
                  method="POST"
                  target="external-iframe"
                  style={{ display: 'none' }}
                >
                  <input type="hidden" name="sso_token" value={localStorage.getItem('sso_token') || ''} />
                  <input type="hidden" name="username" value={localStorage.getItem('user-name') || ''} />
                  <input type="hidden" name="auto_login" value="true" />
                  <input type="hidden" name="source" value="master_dashboard" />
                </form>
              </div>
            </div>
          )}
        </main>
      </div>


      {/* Settings Popup */}
      {showSettingsPopup && <SettingsPopup />}

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingUser ? "Edit User" : "Create New User"}
                </h2>
                <button
                  onClick={() => {
                    setShowUserModal(false);
                    setEditingUser(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
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
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="employee_code"
                      defaultValue={editingUser?.employee_code}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      placeholder="e.g., PMMPL-1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={editingUser?.name}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      placeholder="e.g., John Doe"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="username"
                      defaultValue={editingUser?.username}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      placeholder="e.g., john.doe"
                      required
                      disabled={!!editingUser}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        defaultValue=""
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 pr-10"
                        placeholder="Enter password"
                        required={!editingUser}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="role"
                        defaultValue={editingUser?.role || 'user'}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department
                      </label>
                      <input
                        type="text"
                        name="department"
                        defaultValue={editingUser?.department}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        placeholder="e.g., Human Resources"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserModal(false);
                      setEditingUser(null);
                    }}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingSystem}
                    className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSavingSystem ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : editingUser ? (
                      <>
                        <Save className="w-4 h-4" />
                        Update User
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        Create User
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    System Access for {selectedUserForAccess.name}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Currently has {userAccessStats[selectedUserForAccess.username]?.accessibleApps || 0} systems
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowAccessModal(false);
                    setSelectedUserForAccess(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Select/deselect systems for <span className="font-semibold">{selectedUserForAccess.username}</span>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {allApps.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => handleAppSelection(app.id)}
                    className={`p-3 border rounded-lg cursor-pointer transition ${selectedApps.includes(app.id)
                      ? "border-sky-500 bg-gradient-to-r from-sky-50 to-blue-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center ${selectedApps.includes(app.id)
                        ? "bg-sky-500 border-sky-500"
                        : "bg-white border-gray-300"
                        }`}>
                        {selectedApps.includes(app.id) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{app.label || app.name}</div>
                        <div className="text-xs text-gray-500 truncate">{app.url}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {allApps.length === 0 && (
                <div className="text-center py-8">
                  <Database className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No systems available</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    Selected: <span className="font-medium text-sky-600">{selectedApps.length} systems</span>
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowAccessModal(false);
                      setSelectedUserForAccess(null);
                    }}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAssignAccess}
                    disabled={isSavingSystem}
                    className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSavingSystem ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Save Access
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
          className={`fixed top-5 right-5 z-[9999] px-4 py-3 rounded-lg shadow-lg text-white text-sm flex items-center gap-2 animate-slide-in-right ${toast.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
        >
          {toast.type === "success" ? (
            <Check className="w-4 h-4" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          {toast.message}
        </div>
      )}
    </div>
  );
}