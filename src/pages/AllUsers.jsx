import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserDetailsApi } from "../redux/api/settingApi";
import { fetchAllEmployees } from "../redux/slice/employee";
import { 
  User, Calendar, Phone, Mail, Building,
  Award, Factory, Leaf, Shield, TrendingUp, 
  Users, Globe, Trophy, ArrowRight, ExternalLink,
  MapPin
} from "lucide-react";
import logo from "../assets/Passary-refractories-logo.png";
import prasadPassary from "../assets/Pradeep-passary.png";
import kavitPassary from "../assets/Kavit-passary.png";
import bithalPassary from "../assets/Bitthal-passary.png";
import jaidhishPassary from "../assets/Jaidhish-passary.png";
import whrb from "../assets/WasteHeatRecoveryBoiler.avif";
import thermalPower from "../assets/thermalpowerplant.avif";
import cfbcBoiler from "../assets/CFBCBoiler.avif";
import afbcBoiler from "../assets/AFBCBoiler.avif";
import pelletPlant from "../assets/PelletPlant.avif";
import spongeIron from "../assets/SpongeIronPlant.avif";
import ductileIron from "../assets/DuctileIronPipe.avif";
import rollingMill from "../assets/RollingMill.avif";
import inductionFurnace from "../assets/inductionfurnace.avif";

const HomePage = () => {
    const dispatch = useDispatch();
    
    const { employees, loading: employeeLoading } = useSelector(
        (state) => state.employee
    );
    
    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [photoError, setPhotoError] = useState(false);

    // Convert Google Drive link to direct image URL
  const getDriveDirectUrl = (url) => {
    if (!url || url.trim() === '') {
        return null;
    }
    
    console.log("Processing image URL:", url);
    
    // If already a direct image URL, return as is
    if (url.includes("googleusercontent.com") || 
        url.includes("lh3.googleusercontent.com") ||
        url.startsWith("data:image") ||
        url.startsWith("http") && (url.includes(".jpg") || url.includes(".png") || url.includes(".jpeg") || url.includes(".webp"))) {
        return url;
    }
    
    // Handle various Google Drive link formats
    
    // Format 1: https://drive.google.com/file/d/FILE_ID/view?usp=drive_link
    // Format 2: https://drive.google.com/open?id=FILE_ID
    // Format 3: https://drive.google.com/uc?id=FILE_ID&export=download
    // Format 4: https://drive.google.com/thumbnail?id=FILE_ID
    
    let fileId = null;
    
    // Try multiple patterns to extract file ID
    const patterns = [
        /\/file\/d\/([^\/\?]+)/,  // /file/d/FILE_ID
        /\/d\/([^\/\?]+)/,        // /d/FILE_ID
        /id=([^&]+)/,             // ?id=FILE_ID
        /\/uc\?id=([^&]+)/,       // /uc?id=FILE_ID
        /[-\w]{25,}/              // Google Drive ID pattern (33 chars)
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            fileId = match[1] || match[0];
            if (fileId && fileId.length >= 33) { // Google Drive IDs are 33 chars
                console.log("Found file ID:", fileId);
                break;
            }
        }
    }
    
    if (fileId) {
        // Return different types of Google Drive URLs to try
        const urlsToTry = [
            `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`, // Thumbnail
            `https://drive.google.com/uc?id=${fileId}&export=view`,     // Direct download view
            `https://lh3.googleusercontent.com/d/${fileId}=s400-c`,     // Google Photos style
            `https://docs.google.com/uc?export=view&id=${fileId}`,      // Docs viewer
        ];
        
        return urlsToTry[0]; // Return the first one, we'll handle fallback in onError
    }
    
    // If not a Google Drive URL, return original
    return url;
};
    // Fallback avatar with initials
    const getFallbackAvatar = (name = "", size = 64) => {
        let initials = "US";
        if (name) {
            const nameParts = name.split(' ');
            if (nameParts.length >= 2) {
                initials = (nameParts[0][0] + nameParts[1][0]).toUpperCase();
            } else if (nameParts.length === 1 && nameParts[0].length >= 2) {
                initials = nameParts[0].substring(0, 2).toUpperCase();
            }
        }
        
        return `https://ui-avatars.com/api/?name=${initials}&background=6366f1&color=fff&size=${size}&bold=true`;
    };

    // Fetch all required data
    const fetchEmployeeDetails = async () => {
        try {
            setLoading(true);

            // 1. Fetch user details from USER sheet
            const usersRes = await fetchUserDetailsApi();
            const username = localStorage.getItem("user-name");

            if (Array.isArray(usersRes) && usersRes.length > 0) {
                let currentUser = usersRes.find(u => 
                    (u.user_name || u.username) && 
                    (u.user_name || u.username).toString().trim().toLowerCase() === username?.toString().trim().toLowerCase()
                );

                if (currentUser) {
                    let employeeCode = '';
                    const possibleFields = [
                        'Employee Code', 'employeeCode', 'employee_id', 
                        'Employee_Code', 'empCode', 'EmployeeCode'
                    ];
                    
                    for (const field of possibleFields) {
                        if (currentUser[field]) {
                            employeeCode = currentUser[field].toString().trim();
                            break;
                        }
                    }
                    
                    if (!employeeCode) {
                        for (const [key, value] of Object.entries(currentUser)) {
                            if (value && value.toString().includes('PMMPL')) {
                                employeeCode = value.toString().trim();
                                break;
                            }
                        }
                    }
                    
                    if (employeeCode) {
                        currentUser.employee_id = employeeCode;
                    }
                    
                    setUserDetails(currentUser);
                } else {
                    const testUser = {
                        user_name: username || "demo",
                        employee_id: "PMMPL-1",
                        name: "Demo User",
                        department: "Demo Department",
                        role: "user",
                        status: "active"
                    };
                    setUserDetails(testUser);
                }
            } else {
                const username = localStorage.getItem("user-name") || "demo";
                const testUser = {
                    user_name: username,
                    employee_id: "PMMPL-1",
                    name: `${username} User`,
                    department: "Demo Department",
                    role: "user",
                    status: "active"
                };
                setUserDetails(testUser);
            }

            // 2. Fetch all employees from EMPLOYEE sheet
            await dispatch(fetchAllEmployees()).unwrap();

        } catch (error) {
            console.error("❌ Error fetching data:", error);
            const username = localStorage.getItem("user-name") || "demo";
            const testUser = {
                user_name: username,
                employee_id: "PMMPL-1",
                name: `${username} User`,
                department: "Demo Department",
                role: "user",
                status: "active"
            };
            setUserDetails(testUser);
        } finally {
            setLoading(false);
        }
    };

    // Find employee data for current user
    const displayEmployeeData = useMemo(() => {
        if (!userDetails || !employees || employees.length === 0) {
            return null;
        }

        const userEmpId = userDetails.employee_id || '';
        
        if (!userEmpId || userEmpId.toString().trim() === '') {
            return null;
        }

        const cleanEmpId = userEmpId.toString().trim();

        let matchedEmployee = employees.find(emp => {
            const empCode = emp['Employee Code'] || '';
            return empCode.toString().trim() === cleanEmpId;
        });

        if (!matchedEmployee) {
            matchedEmployee = employees.find(emp => {
                const empCode = emp['Employee Code'] || '';
                return empCode.toString().trim().toUpperCase() === cleanEmpId.toUpperCase();
            });
        }

        if (matchedEmployee) {
            const photoUrl = matchedEmployee["Candidate's Photo"] || matchedEmployee.photo || "";
            const directPhotoUrl = getDriveDirectUrl(photoUrl);

            return {
                employeeCode: matchedEmployee["Employee Code"] || "",
                name: matchedEmployee["Name"] || "",
                dateOfJoining: matchedEmployee["Date Of Joining"] || "",
                designation: matchedEmployee["Designation"] || "",
                photo: directPhotoUrl,
                mobile: matchedEmployee["Mobile No."] || matchedEmployee["Mobile No"] || "",
                email: matchedEmployee["Personal Email-Id"] || matchedEmployee["Personal Email Link"] || "",
                isRealData: true
            };
        }

        return null;
    }, [userDetails, employees]);

    useEffect(() => {
        fetchEmployeeDetails();
    }, []);

    // Handle photo loading error
const handlePhotoError = (e) => {
    const target = e.target;
    const originalSrc = target.src;
    const dataSrc = target.getAttribute('data-original-src') || originalSrc;
    
    console.log("Image failed to load:", dataSrc);
    
    // Track retry attempts
    const retryCount = parseInt(target.getAttribute('data-retry') || '0');
    
    if (retryCount < 3) {
        // Try different URL formats
        if (dataSrc.includes('drive.google.com')) {
            const fileIdMatch = dataSrc.match(/[-\w]{25,}/);
            if (fileIdMatch) {
                const fileId = fileIdMatch[0];
                const fallbackUrls = [
                    `https://drive.google.com/uc?id=${fileId}&export=download`,
                    `https://docs.google.com/uc?export=download&id=${fileId}`,
                    `https://drive.google.com/file/d/${fileId}/preview`,
                    `https://lh3.googleusercontent.com/d/${fileId}=s200`, // Smaller size
                ];
                
                if (retryCount < fallbackUrls.length) {
                    target.src = fallbackUrls[retryCount];
                    target.setAttribute('data-retry', retryCount + 1);
                    console.log(`Retrying with URL ${retryCount + 1}:`, fallbackUrls[retryCount]);
                    return;
                }
            }
        }
    }
    
    // Final fallback - use initials avatar
    const employeeName = displayEmployeeData?.name || "";
    target.src = getFallbackAvatar(employeeName);
    target.onerror = null; // Prevent infinite loop
    setPhotoError(true);
    console.log("Using fallback avatar for:", employeeName);
};
    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            let date;
            if (typeof dateString === 'string' && dateString.includes('/')) {
                const parts = dateString.split('/');
                if (parts.length === 3) {
                    date = new Date(parts[2], parts[0] - 1, parts[1]);
                } else {
                    date = new Date(dateString);
                }
            } else {
                date = new Date(dateString);
            }
            
            if (isNaN(date.getTime())) return dateString;
            return date.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    };

    const milestones = [
        { year: "1990", title: "The Beginning", description: "Established as manufacturer of synthetic raw materials for refractory companies" },
        { year: "1992", title: "Passary Minerals", description: "First plant to refine minerals for refractory industry" },
        { year: "Pioneer", title: "India's First Synthetic Mullite", description: "Broke import dependency from China" },
        { year: "Innovation", title: "Mullite-Based Castables", description: "First in India to introduce this technology" },
        { year: "Breakthrough", title: "Dual-Layer Casting", description: "Pioneered in rotary kilns - our flagship innovation" },
        { year: "Today", title: "Market Leader", description: "Specialized castables for DRI and Pellet industry" }
    ];

    const values = [
        { icon: <Leaf className="w-8 h-8" />, title: "Sustainability", description: "Driving energy-efficient solutions for a greener future", color: "bg-green-100 text-green-600" },
        { icon: <Shield className="w-8 h-8" />, title: "Quality", description: "Uncompromising standards in refractory solutions", color: "bg-blue-100 text-blue-600" },
        { icon: <TrendingUp className="w-8 h-8" />, title: "Innovation", description: "Pioneering new technologies in refractory industry", color: "bg-purple-100 text-purple-600" },
        { icon: <Users className="w-8 h-8" />, title: "Partnership", description: "From suppliers to trusted partners", color: "bg-orange-100 text-orange-600" },
        { icon: <Factory className="w-8 h-8" />, title: "Make in India", description: "Committed to India's industrial self-reliance", color: "bg-indigo-100 text-indigo-600" },
        { icon: <Globe className="w-8 h-8" />, title: "Global Vision", description: "World's most trusted refractory experts", color: "bg-teal-100 text-teal-600" }
    ];

    const leadershipTeam = [
        { name: "Pradeep Passary", role: "Chairman & MD", image: prasadPassary },
        { name: "Kavit Passary", role: "Director", image: kavitPassary },
        { name: "Bithtal Passary", role: "Director", image: bithalPassary },
        { name: "Jaidhish Passary", role: "Director", image: jaidhishPassary }
    ];

    const industrySolutions = [
        { title: "Waste Heat Recovery Boilers (WHRB)", image: whrb },
        { title: "Thermal Power Plants", image: thermalPower },
        { title: "CFBC Boilers", image: cfbcBoiler },
        { title: "AFBC Boilers", image: afbcBoiler },
        { title: "Pellet Plants", image: pelletPlant },
        { title: "Sponge Iron Plants", image: spongeIron },
        { title: "Ductile Iron Pipes", image: ductileIron },
        { title: "Rolling Mills", image: rollingMill },
        { title: "Induction Furnaces", image: inductionFurnace }
    ];

    const latestPosts = [
        { type: "BLOG", date: "23 Oct 2025", title: "Latest Insights & Updates", category: "Industry Trends" },
        { type: "BLOG", date: "23 Oct 2025", title: "Innovations in Refractory Technology", category: "Technology" },
        { type: "ENGLISH", date: "23 Oct 2025", title: "Market Analysis Report", author: "Mahendra", category: "Market Analysis" }
    ];

    const isAdmin = localStorage.getItem("user-name")?.toLowerCase() === "admin";

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading employee profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-gradient-to-b from-gray-50 to-white min-h-screen">
            {/* Top Navigation Bar - Fixed */}
            <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img src={logo} alt="Passary Refractories" className="h-10 w-auto" />
                            <div>
                                <h1 className="text-lg font-bold text-gray-900">Passary Refractories</h1>
                                <p className="text-xs text-gray-600">Employee Portal</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Compact Employee Profile - AT THE VERY TOP */}
            {!isAdmin && displayEmployeeData && (
                <div className="w-full bg-white border-b border-gray-200">
                    <div className="container mx-auto px-4 md:px-8 py-4">
                        <div className="mb-3">
                            <div className="flex items-center gap-2">
                                <User className="w-5 h-5 text-orange-600" />
                                <h1 className="text-lg font-bold text-gray-900">My Profile</h1>
                                <span className="text-gray-600 text-sm ml-2">Employee information</span>
                            </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            {/* Profile Avatar */}
                            <div className="flex items-center gap-3">
                                <div className="relative w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-lg">
                                    {displayEmployeeData?.photo && !photoError ? (
                                        <img
                                            src={displayEmployeeData.photo}
                                            alt={displayEmployeeData.name}
                                            className="w-full h-full object-cover"
                                            onError={handlePhotoError}
                                        />
                                    ) : (
                                        <img
                                            src={getFallbackAvatar(displayEmployeeData?.name)}
                                            alt={displayEmployeeData?.name}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        {displayEmployeeData?.name || "N/A"}
                                    </h2>
                                    <p className="text-orange-600 font-medium">
                                        {displayEmployeeData?.designation || "Designation not specified"}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                                            {displayEmployeeData?.employeeCode || "N/A"}
                                        </span>
                                        <span className="text-gray-500 text-xs flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {formatDate(displayEmployeeData?.dateOfJoining)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information Grid */}
                            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                                        <Calendar className="w-4 h-4 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Joined</p>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {formatDate(displayEmployeeData?.dateOfJoining)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                        <Phone className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Mobile</p>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {displayEmployeeData?.mobile || "N/A"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                                        <Mail className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Email</p>
                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                            {displayEmployeeData?.email || "N/A"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                                        <Building className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Department</p>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {displayEmployeeData?.designation?.split(' ')[0] || "N/A"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Hero Section - RIGHT BELOW PROFILE */}
            <section id="home" className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
                <div className="container mx-auto px-4 md:px-8 py-12 md:py-16">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-2xl md:text-4xl font-bold mb-4">
                            Engineering Refractory Excellence Since 1990
                        </h1>
                        <p className="text-base md:text-lg text-gray-200 mb-6">
                            From steel and cement to power and sponge iron, our refractory products and solutions are engineered to perform across the toughest industrial environments.
                        </p>
                        <div className="flex flex-wrap gap-3 justify-center">
                            <a href="#about" className="px-5 py-2 bg-orange-500 rounded-lg font-semibold hover:bg-orange-600 text-sm">
                                Know More
                            </a>
                            <a href="#contact" className="px-5 py-2 bg-white/10 rounded-lg font-semibold hover:bg-white/20 border border-white/30 text-sm">
                                Get in Touch
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="container mx-auto px-4 md:px-8 py-6">
                {/* Welcome Banner */}
                <div className="mb-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-4 text-white">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div>
                            <h2 className="text-lg md:text-xl font-bold mb-1">
                                Welcome back, {displayEmployeeData?.name?.split(' ')[0] || "Team Member"}!
                            </h2>
                            <p className="text-orange-100 text-sm">
                                {new Date().toLocaleDateString('en-IN', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}
                            </p>
                        </div>
                        <div className="mt-3 md:mt-0">
                            <div className="px-4 py-2 bg-white/20 rounded-lg text-center">
                                <p className="text-xs">Total Employees</p>
                                <p className="font-bold text-lg">{employees?.length || 306}+</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* About Us Section */}
                <section id="about" className="mb-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                        <div className="space-y-3">
                            <h2 className="text-2xl font-bold text-gray-900">PASSARY REFRACTORIES</h2>
                            <h3 className="text-lg font-semibold text-orange-600">Engineering Refractory Excellence Since 1990</h3>
                            <p className="text-gray-700 text-sm">
                                Established in 1990, Passary Refractories began its journey as a manufacturer of synthetic raw materials for refractory companies. Over the years, we have evolved into a frontrunner in developing technologically advanced and energy-efficient castables tailored for the secondary steel industry.
                            </p>
                            <p className="text-gray-700 text-sm">
                                As the pioneers of Mullite-Based Castables and Dual Layer Casting in India, Passary Refractories has emerged as a market leader in specialized castables for the DRI and Pellet industry.
                            </p>
                            <button className="px-5 py-2.5 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 text-sm">
                                KNOW MORE
                            </button>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-5">
                            <div className="text-center space-y-3">
                                <div className="w-20 h-20 mx-auto rounded-full bg-orange-500 flex items-center justify-center">
                                    <Factory className="w-10 h-10 text-white" />
                                </div>
                                <h4 className="text-lg font-bold text-gray-900">Complete Refractory Solutions</h4>
                                <p className="text-gray-600 text-sm">From supply to application - Your one-stop partner</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-orange-50 rounded-lg p-3">
                                        <p className="text-xl font-bold text-orange-600">95%</p>
                                        <p className="text-xs text-gray-600">In-House Production</p>
                                    </div>
                                    <div className="bg-red-50 rounded-lg p-3">
                                        <p className="text-xl font-bold text-red-600">30+</p>
                                        <p className="text-xs text-gray-600">Years Experience</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Leadership Team Section */}
                <section id="leadership" className="mb-8">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Guiding Our Journey</h2>
                        <p className="text-gray-600 text-sm">Meet the visionary leaders shaping the future of refractory industry</p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {leadershipTeam.map((leader, index) => (
                            <div key={index} className="text-center">
                                <div className="relative mb-3">
                                    <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-white shadow">
                                        <img 
                                            src={leader.image} 
                                            alt={leader.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white">
                                        <Trophy className="w-4 h-4" />
                                    </div>
                                </div>
                                <h3 className="text-base font-bold text-gray-900 mb-1">{leader.name}</h3>
                                <p className="text-orange-600 font-semibold text-sm">{leader.role}</p>
                                <p className="text-gray-600 text-xs mt-1">Driving excellence since 1990</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Latest Insights Section */}
                <section id="insights" className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Latest Insights & Updates</h2>
                            <p className="text-gray-600 text-sm">Stay updated with industry trends and company news</p>
                        </div>
                        <button className="text-orange-600 font-semibold hover:text-orange-700 flex items-center gap-1 text-sm">
                            View All
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {latestPosts.map((post, index) => (
                            <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow">
                                <div className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                                            {post.type}
                                        </span>
                                        <span className="text-gray-500 text-xs">{post.date}</span>
                                    </div>
                                    <h3 className="text-base font-bold text-gray-900 mb-2">
                                        {post.title}
                                    </h3>
                                    <div className="flex items-center justify-between">
                                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                            {post.category}
                                        </span>
                                        {post.author && (
                                            <span className="text-gray-600 text-xs">By {post.author}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                                    <a href="#" className="text-orange-600 font-semibold text-xs hover:text-orange-700 flex items-center gap-1">
                                        Read Article
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Industry Solutions Section */}
                <section id="solutions" className="mb-8">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Industry Focus Solutions</h2>
                        <p className="text-gray-600 text-sm">Engineered to perform across the toughest industrial environments</p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {industrySolutions.slice(0, 6).map((solution, index) => (
                            <div key={index} className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow">
                                <div className="h-40 overflow-hidden">
                                    <img 
                                        src={solution.image} 
                                        alt={solution.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="p-3">
                                    <h3 className="font-bold text-gray-900 text-sm">{solution.title}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Key Achievements */}
                <div className="mb-8">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Key Achievements & Innovations</h2>
                        <div className="w-16 h-1.5 bg-orange-500 rounded-full mx-auto"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-3">
                                <Factory className="w-6 h-6 text-orange-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Manufacturing Leap</h3>
                            <p className="text-gray-700 text-sm">
                                Ventured into castables, achieving <span className="font-bold text-orange-600">95% in-house production</span> capability.
                            </p>
                        </div>

                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                                <Award className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Mullite's Indian Debut</h3>
                            <p className="text-gray-700 text-sm">
                                Pioneered <span className="font-bold text-blue-600">Mullite-based refractories</span> in India, breaking import dependency.
                            </p>
                        </div>

                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                                <TrendingUp className="w-6 h-6 text-green-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">The Casting Shift</h3>
                            <p className="text-gray-700 text-sm">
                                Introduced <span className="font-bold text-green-600">dual-layer refractor</span> in rotary kilns—our flagship innovation.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Timeline Section */}
                <section id="milestones" className="mb-8">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Journey Through Time</h2>
                        <p className="text-gray-600 text-sm">From humble beginnings to industry leadership</p>
                    </div>
                    
                    <div className="relative">
                        <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-orange-400"></div>
                        
                        {milestones.map((milestone, index) => (
                            <div key={index} className={`flex flex-col md:flex-row items-center mb-6 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                                <div className="w-full md:w-1/2 px-3">
                                    <div className={`bg-white p-4 rounded-xl shadow border border-gray-200 ${index % 2 === 0 ? 'md:text-right' : ''}`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                                                {milestone.year}
                                            </span>
                                        </div>
                                        <h4 className="text-base font-bold text-gray-900 mb-1">{milestone.title}</h4>
                                        <p className="text-gray-700 text-sm">{milestone.description}</p>
                                    </div>
                                </div>
                                <div className="hidden md:flex w-6 h-6 rounded-full bg-orange-500 border-4 border-white z-10"></div>
                                <div className="md:w-1/2"></div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Values Section */}
                <section id="values" className="mb-8">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Core Values</h2>
                        <p className="text-gray-600 text-sm">The principles that guide our journey and define our legacy</p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {values.map((value, index) => (
                            <div key={index} className="bg-white rounded-xl p-4 border border-gray-200">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${value.color}`}>
                                    {value.icon}
                                </div>
                                <h3 className="text-base font-bold text-gray-900 mb-1">{value.title}</h3>
                                <p className="text-gray-700 text-sm">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Stats Section */}
                <div className="mb-8 bg-gray-900 rounded-xl p-5 text-white">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold mb-1">{employees?.length || 306}+</div>
                            <p className="text-gray-300 text-sm">Employees</p>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold mb-1">30+</div>
                            <p className="text-gray-300 text-sm">Years Experience</p>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold mb-1">95%</div>
                            <p className="text-gray-300 text-sm">In-House Production</p>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold mb-1">50+</div>
                            <p className="text-gray-300 text-sm">Countries Served</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer id="contact" className="bg-gray-900 text-white pt-10 pb-6">
                <div className="container mx-auto px-4 md:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <div>
                            <div className="flex items-center mb-4">
                                <img src={logo} alt="Passary Refractories" className="h-10 w-auto mr-3" />
                                <div>
                                    <h3 className="text-lg font-bold">Passary Refractories</h3>
                                    <p className="text-gray-300 text-xs">Engineering Refractory Excellence Since 1990</p>
                                </div>
                            </div>
                            <p className="text-gray-300 mb-3 text-xs">
                                We're saving over <span className="font-bold text-orange-300">1.5 lakh tons of coal energy</span> through innovative refractory solutions.
                            </p>
                            <div className="flex flex-wrap gap-1">
                                <span className="px-2 py-1 bg-orange-600 rounded-full text-xs">Make in India</span>
                                <span className="px-2 py-1 bg-blue-600 rounded-full text-xs">Energy Efficient</span>
                                <span className="px-2 py-1 bg-green-600 rounded-full text-xs">Sustainable</span>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-base font-semibold mb-3 text-orange-400">Contact Us</h4>
                            <div className="space-y-2">
                                <div className="flex items-start">
                                    <Phone className="w-4 h-4 mt-0.5 mr-2 text-orange-500 flex-shrink-0" />
                                    <span className="text-gray-300 text-sm">+7222980807</span>
                                </div>
                                <div className="flex items-start">
                                    <Mail className="w-4 h-4 mt-0.5 mr-2 text-orange-500 flex-shrink-0" />
                                    <span className="text-gray-300 text-sm">pmmpl@pasmin.com</span>
                                </div>
                                <div className="flex items-start">
                                    <MapPin className="w-4 h-4 mt-0.5 mr-2 text-orange-500 flex-shrink-0" />
                                    <span className="text-gray-300 text-xs">Shriram Business Park, Block-C, 2nd Floor, Shop No - 217,218, Vidhansabha Road, Near Swarnabhoomi, Raipur, Pin- 493111, Chhattisgarh, India.</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-base font-semibold mb-3 text-orange-400">Our Products</h4>
                            <ul className="space-y-1">
                                {['Shaped Refractories', 'Unshaped Refractories', 'Insulating Refractories', 'Speciality Refractories'].map((product, idx) => (
                                    <li key={idx} className="flex items-center">
                                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></div>
                                        <span className="text-gray-300 text-xs">{product}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-base font-semibold mb-3 text-orange-400">Our Location</h4>
                            <div className="bg-gray-800 rounded-xl overflow-hidden">
                                <iframe
                                    src="https://www.google.com/maps?q=21.282988041931297,81.70320181892319&hl=en&z=16&output=embed"
                                    width="100%"
                                    height="120"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Google Map Location"
                                    className="rounded-lg"
                                ></iframe>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-700 pt-6 mt-6">
                        <div className="flex flex-col md:flex-row justify-between items-center">
                            <div className="text-center md:text-left">
                                <p className="text-gray-400 text-sm">
                                    &copy; {new Date().getFullYear()} Passary Refractories. All rights reserved.
                                </p>
                                <p className="text-gray-500 text-xs mt-1">
                                    Pioneering refractory solutions since 1990 • Making India self-reliant in refractory technology
                                </p>
                            </div>
                            <div className="mt-3 md:mt-0">
                                <p className="text-gray-400 text-sm">
                                    Powered by{" "}
                                    <a href="https://botivate.in/" className="text-orange-400 hover:text-orange-300 hover:underline font-medium">
                                        Botivate
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;