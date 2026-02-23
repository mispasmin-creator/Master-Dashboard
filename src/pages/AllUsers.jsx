import { useState, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserDetailsApi } from "../redux/api/settingApi";
import { fetchAllEmployees } from "../redux/slice/employee";
import {
    User, Calendar, Phone, Mail, Building,
    Award, Factory, Leaf, Shield, TrendingUp,
    Users, Globe, Trophy, ArrowRight, ExternalLink,
    MapPin, CheckCircle2, ClipboardList, Clock, AlertCircle, XCircle,
    Target, BarChart2, FileText, LogIn, Camera, Edit2,
    ChevronRight, Star, Zap, Heart, Award as AwardIcon,
    BookOpen, Briefcase, Github, Linkedin, Twitter,
    Instagram, Facebook, Youtube, MessageCircle,
    Send, Mail as MailIcon, Phone as PhoneIcon,
    MapPin as MapPinIcon, Clock as ClockIcon
} from "lucide-react";
import logo from "../assets/Passary-refractories-logo.png";
import prasadPassary from "../assets/Pradeep-passary.png";
import kavitPassary from "../assets/Kavit-passary.png";
import bithalPassary from "../assets/bitthal-passary.png";
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

// Brand colors matching the olive green Passary logo
const BRAND = {
    primary: "#6B8E23",       // olive green
    primaryLight: "#8CB04E",  // lighter olive
    primaryDark: "#4A5D23",   // darker olive
    accent: "#DAA520",        // golden rod
    surface: "#F5F7F2",       // light olive-tinted surface
    text: "#2C3E50",          // dark slate
    textLight: "#5D6D7E",     // lighter text
};

// App Script URLs - Replace with your actual deployed URL
const APP_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxsnYdk8E0bJqXELf-I2DrFwZv4nTtFe6gQMKnKDbrzg0HmZ7KPqAhZWgjK17Vwlzfrjg/exec";

const MISS_PUNCH_FORM = "https://docs.google.com/forms/d/e/1FAIpQLSeNasq57F_X4EVoWljBWyy8YCzwNBTZrdFBijGTNuw10D906Q/viewform?usp=sf_link";
const LEAVE_FORM = "https://docs.google.com/forms/d/e/1FAIpQLSesdfZZW8kCyeVhWzuw7DkKplNg04e30TaAnwL7qGyV0HXBvQ/viewform?usp=sf_link";
const GOOGLE_FOLDER_ID = "11h7_k0_2FurPStw_4_c34vtLGTU1HxHL";

const HomePage = () => {
    const dispatch = useDispatch();
    const fileInputRef = useRef(null);

    const { employees, loading: employeeLoading } = useSelector(
        (state) => state.employee
    );

    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [photoError, setPhotoError] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [activeSection, setActiveSection] = useState("profile");

    // Extract Google Drive file ID from any Drive URL format
    const getDriveFileId = (url) => {
        if (!url || url.trim() === '') return null;
        const cleanUrl = url.trim();
        const patterns = [
            /\/file\/d\/([a-zA-Z0-9_-]{25,})/,
            /\/d\/([a-zA-Z0-9_-]{25,})/,
            /[?&]id=([a-zA-Z0-9_-]{25,})/,
            /\/uc\?id=([a-zA-Z0-9_-]{25,})/,
            /open\?id=([a-zA-Z0-9_-]{25,})/,
        ];
        for (const pattern of patterns) {
            const match = cleanUrl.match(pattern);
            if (match && match[1]) return match[1];
        }
        return null;
    };

    // Convert Google Drive link to best direct image URL
    const getDriveDirectUrl = (url) => {
        if (!url || url.trim() === '') return null;
        const cleanUrl = url.trim();
        if (cleanUrl.startsWith('data:image')) return cleanUrl;
        if (cleanUrl.includes('googleusercontent.com')) return cleanUrl;
        if (cleanUrl.includes('drive.google.com/thumbnail')) return cleanUrl;

        const fileId = getDriveFileId(cleanUrl);
        if (fileId) {
            // Use the open/thumbnail endpoint — works without auth for public files
            return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
        }
        if (cleanUrl.startsWith('http')) return cleanUrl;
        return null;
    };

    // Build a fallback chain for a Drive photo URL: thumbnail → lh3 → uc export → initials
    const getDrivePhotoWithFallbacks = (url, name) => {
        const fileId = getDriveFileId(url || '');
        if (!fileId) return { primary: null, fallbacks: [] };
        return {
            primary: `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`,
            fallbacks: [
                `https://lh3.googleusercontent.com/d/${fileId}=s400`,
                `https://drive.google.com/uc?export=view&id=${fileId}`,
                getFallbackAvatar(name, 80),
            ]
        };
    };

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

    const fetchEmployeeDetails = async () => {
        try {
            setLoading(true);
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
                const uname = localStorage.getItem("user-name") || "demo";
                setUserDetails({
                    user_name: uname,
                    employee_id: "PMMPL-1",
                    name: `${uname} User`,
                    department: "Demo Department",
                    role: "user",
                    status: "active"
                });
            }

            await dispatch(fetchAllEmployees()).unwrap();

        } catch (error) {
            const uname = localStorage.getItem("user-name") || "demo";
            setUserDetails({
                user_name: uname,
                employee_id: "PMMPL-1",
                name: `${uname} User`,
                department: "Demo Department",
                role: "user",
                status: "active"
            });
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

            const safeNum = (val) => {
                const n = parseFloat(val);
                return isNaN(n) ? 0 : n;
            };

            const pendingWork = matchedEmployee["Pending Work's"] || matchedEmployee["All Pending Till Date"] || "0";
            const todayTask = matchedEmployee["Today Task"] || "0";
            const totalAchievement = matchedEmployee["Total Achievement"] || "0";
            const target = matchedEmployee["Target"] || "0";
            const punchDays = matchedEmployee["Punch Days"] || "0";
            const missPunch = matchedEmployee["Punch Miss"] || "0";
            const workNotDonePct = matchedEmployee["% Work Not Done"] || "0";
            const workNotDoneOnTimePct = matchedEmployee["% Work Not Done On Time"] || "0";
            const weekPending = matchedEmployee["Week Pending Task"] || "0";
            const extraDone = matchedEmployee["Extra Done"] || "0";
            const actualAchievement = matchedEmployee["Actual Achievement"] || "0";
            const totalOnTime = matchedEmployee["Total On Time (>=8)"] || "0";
            const lateDays = matchedEmployee["Late Days(4-8)"] || "0";
            const absent = matchedEmployee["Absent(<4)"] || "0";

            const targetNum = safeNum(target);
            const achievedNum = safeNum(totalAchievement);
            const progressPct = targetNum > 0 ? Math.min(100, Math.round((achievedNum / targetNum) * 100)) : 0;

            return {
                employeeCode: matchedEmployee["Employee Code"] || "",
                name: matchedEmployee["Name"] || "",
                dateOfJoining: matchedEmployee["Date Of Joining"] || "",
                designation: matchedEmployee["Designation"] || "",
                photo: directPhotoUrl,
                mobile: matchedEmployee["Mobile No."] || matchedEmployee["Mobile No"] || "",
                email: matchedEmployee["Personal Email-Id"] || matchedEmployee["Personal Email Link"] || "",
                // Task stats
                pendingWork,
                todayTask,
                totalAchievement,
                target,
                punchDays,
                missPunch,
                workNotDonePct,
                workNotDoneOnTimePct,
                weekPending,
                extraDone,
                actualAchievement,
                totalOnTime,
                lateDays,
                absent,
                progressPct,
                isRealData: true,
                matchedEmployee
            };
        }

        return null;
    }, [userDetails, employees]);

    useEffect(() => {
        fetchEmployeeDetails();
    }, []);

    const handlePhotoError = (e) => {
        const target = e.target;
        const originalSrc = target.src;
        const dataSrc = target.getAttribute('data-original-src') || originalSrc;
        const retryCount = parseInt(target.getAttribute('data-retry') || '0');

        if (retryCount < 3) {
            if (dataSrc.includes('drive.google.com')) {
                const fileIdMatch = dataSrc.match(/[-\w]{25,}/);
                if (fileIdMatch) {
                    const fileId = fileIdMatch[0];
                    const fallbackUrls = [
                        `https://drive.google.com/uc?id=${fileId}&export=download`,
                        `https://docs.google.com/uc?export=download&id=${fileId}`,
                        `https://lh3.googleusercontent.com/d/${fileId}=s200`,
                    ];

                    if (retryCount < fallbackUrls.length) {
                        target.src = fallbackUrls[retryCount];
                        target.setAttribute('data-retry', retryCount + 1);
                        return;
                    }
                }
            }
        }

        const employeeName = displayEmployeeData?.name || "";
        target.src = getFallbackAvatar(employeeName);
        target.onerror = null;
        setPhotoError(true);
    };

    const handleProfilePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file || !displayEmployeeData?.employeeCode) return;

        setUploading(true);
        setUploadSuccess(false);

        try {
            const base64Data = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            const formData = new FormData();
            formData.append("action", "uploadEmployeePhoto");
            formData.append("base64Data", base64Data);
            formData.append("fileName", file.name);
            formData.append("mimeType", file.type);
            formData.append("folderId", GOOGLE_FOLDER_ID);
            formData.append("employeeCode", displayEmployeeData.employeeCode);

            const response = await fetch(APP_SCRIPT_URL, {
                method: "POST",
                body: formData,
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || "Upload failed");
            }

            setUploadSuccess(true);
            setTimeout(() => setUploadSuccess(false), 3000);

            await dispatch(fetchAllEmployees()).unwrap();
            setPhotoError(false);

            alert("Photo uploaded successfully!");

        } catch (err) {
            console.error(err);
            alert("Upload failed: " + err.message);
        } finally {
            setUploading(false);
        }
    };

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

    // Enhanced Pie chart component
    const TaskCompletionPieChart = ({ achieved, target, size = "md" }) => {
        const percentage = target > 0 ? (achieved / target) * 100 : 0;
        const radius = size === "sm" ? 30 : 40;
        const circumference = 2 * Math.PI * radius;
        const strokeDashoffset = circumference - (percentage / 100) * circumference;

        const getColor = () => {
            if (percentage >= 80) return BRAND.primary;
            if (percentage >= 50) return BRAND.accent;
            return '#ef4444';
        };

        return (
            <div className={`relative ${size === "sm" ? "w-16 h-16" : "w-24 h-24"}`}>
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                    />
                    <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="none"
                        stroke={getColor()}
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className={`${size === "sm" ? "text-base" : "text-lg"} font-bold`} style={{ color: getColor() }}>
                        {Math.round(percentage)}%
                    </span>
                    {size !== "sm" && <span className="text-xs text-gray-500">Done</span>}
                </div>
            </div>
        );
    };

    // Progress bar component
    const ProgressBar = ({ value, max, label, color = BRAND.primary }) => {
        const percentage = max > 0 ? (value / max) * 100 : 0;
        return (
            <div className="space-y-1">
                <div className="flex justify-between text-xs">
                    <span className="text-gray-600">{label}</span>
                    <span className="font-semibold" style={{ color }}>{value}/{max}</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%`, backgroundColor: color }}
                    />
                </div>
            </div>
        );
    };

    // Stat Card Component
    const StatCard = ({ icon: Icon, label, value, sublabel, color, bgColor }) => (
        <div className="bg-white rounded-xl p-4 shadow-sm border hover:shadow-md transition-all duration-300">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-gray-600 mb-1">{label}</p>
                    <p className="text-2xl font-bold" style={{ color }}>{value}</p>
                    {sublabel && <p className="text-xs text-gray-500 mt-1">{sublabel}</p>}
                </div>
                <div className={`p-3 rounded-lg ${bgColor}`}>
                    <Icon className="w-5 h-5" style={{ color }} />
                </div>
            </div>
        </div>
    );

    const milestones = [
        { year: "1990", title: "The Beginning", description: "Established as manufacturer of synthetic raw materials for refractory companies", icon: Factory },
        { year: "1992", title: "Passary Minerals", description: "First plant to refine minerals for refractory industry", icon: Building },
        { year: "Pioneer", title: "India's First Synthetic Mullite", description: "Broke import dependency from China", icon: Award },
        { year: "Innovation", title: "Mullite-Based Castables", description: "First in India to introduce this technology", icon: Zap },
        { year: "Breakthrough", title: "Dual-Layer Casting", description: "Pioneered in rotary kilns - our flagship innovation", icon: Star },
        { year: "Today", title: "Market Leader", description: "Specialized castables for DRI and Pellet industry", icon: TrendingUp }
    ];

    const values = [
        { icon: <Leaf className="w-6 h-6" />, title: "Sustainability", description: "Driving energy-efficient solutions for a greener future", color: "bg-green-100 text-green-600" },
        { icon: <Shield className="w-6 h-6" />, title: "Quality", description: "Uncompromising standards in refractory solutions", color: "bg-blue-100 text-blue-600" },
        { icon: <TrendingUp className="w-6 h-6" />, title: "Innovation", description: "Pioneering new technologies in refractory industry", color: "bg-purple-100 text-purple-600" },
        { icon: <Users className="w-6 h-6" />, title: "Partnership", description: "From suppliers to trusted partners", color: "bg-orange-100 text-orange-600" },
        { icon: <Factory className="w-6 h-6" />, title: "Make in India", description: "Committed to India's industrial self-reliance", color: "bg-indigo-100 text-indigo-600" },
        { icon: <Globe className="w-6 h-6" />, title: "Global Vision", description: "World's most trusted refractory experts", color: "bg-teal-100 text-teal-600" }
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
        { type: "BLOG", date: "23 Oct 2025", title: "Waste Heat Recovery Boiler Innovation", category: "Industry Trends", image: whrb },
        { type: "BLOG", date: "23 Oct 2025", title: "Innovations in Refractory Technology", category: "Technology", image: cfbcBoiler },
        { type: "ENGLISH", date: "23 Oct 2025", title: "Sponge Iron Plant Refractory Solutions", author: "Mahendra", category: "Market Analysis", image: spongeIron }
    ];

    const achievements = [
        { icon: Factory, value: "95%", label: "In-House Production", color: BRAND.primary },
        { icon: Users, value: "306+", label: "Employees", color: BRAND.primaryLight },
        { icon: Globe, value: "50+", label: "Countries Served", color: BRAND.accent },
        { icon: Award, value: "30+", label: "Years Experience", color: BRAND.primaryDark },
    ];

    const isAdmin = localStorage.getItem("user-name")?.toLowerCase() === "admin";

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen" style={{ background: BRAND.surface }}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-transparent mx-auto" style={{ borderColor: BRAND.primary, borderTopColor: 'transparent' }}></div>
                    <p className="mt-4 font-medium" style={{ color: BRAND.primary }}>Loading employee profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen" style={{ background: BRAND.surface }}>
            {/* Hidden file input for profile photo upload */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
            />


            {/* ── EMPLOYEE PROFILE DASHBOARD — compact single-view, no scroll needed ── */}
            {!isAdmin && displayEmployeeData && (
                <div className="w-full bg-white" style={{ paddingTop: '56px' }}>
                    <div className="container mx-auto px-4 py-4">

                        {/* ━━━ SINGLE UNIFIED QUICK-GLANCE PANEL ━━━ */}
                        <div className="rounded-2xl border border-gray-200 shadow-sm overflow-hidden bg-white">

                            {/* Top accent strip */}
                            <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${BRAND.primaryDark}, ${BRAND.primaryLight}, ${BRAND.accent})` }} />

                            <div className="p-4 md:p-5">

                                {/* ─── ROW 1: Photo + Identity + Actions ─── */}
                                <div className="flex flex-wrap items-center gap-4 pb-4 mb-4 border-b border-gray-100">

                                    {/* Circular Photo — with progressive fallback chain */}
                                    <div className="relative flex-shrink-0">
                                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden shadow-md" style={{ border: `3px solid ${BRAND.primary}` }}>
                                            <img
                                                src={(() => {
                                                    const rawUrl = displayEmployeeData?.matchedEmployee?.["Candidate's Photo"] || displayEmployeeData?.photo || '';
                                                    const fid = getDriveFileId(rawUrl);
                                                    if (fid) return `https://drive.google.com/thumbnail?id=${fid}&sz=w400`;
                                                    if (displayEmployeeData?.photo) return displayEmployeeData.photo;
                                                    return getFallbackAvatar(displayEmployeeData?.name, 80);
                                                })()}
                                                alt={displayEmployeeData?.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    const rawUrl = displayEmployeeData?.matchedEmployee?.["Candidate's Photo"] || '';
                                                    const fid = getDriveFileId(rawUrl);
                                                    const tried = e.target.dataset.tried ? parseInt(e.target.dataset.tried) : 0;
                                                    e.target.dataset.tried = tried + 1;
                                                    const fallbacks = fid ? [
                                                        `https://lh3.googleusercontent.com/d/${fid}=s400`,
                                                        `https://drive.google.com/uc?export=view&id=${fid}`,
                                                        getFallbackAvatar(displayEmployeeData?.name, 80),
                                                    ] : [getFallbackAvatar(displayEmployeeData?.name, 80)];
                                                    if (tried < fallbacks.length) {
                                                        e.target.src = fallbacks[tried];
                                                    } else {
                                                        e.target.onerror = null;
                                                        e.target.src = getFallbackAvatar(displayEmployeeData?.name, 80);
                                                    }
                                                }}
                                            />
                                        </div>
                                        <button onClick={handleProfilePhotoClick} disabled={uploading} title="Change photo"
                                            className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full shadow border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition">
                                            {uploading
                                                ? <div className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: BRAND.primary, borderTopColor: 'transparent' }} />
                                                : <Camera className="w-3 h-3" style={{ color: BRAND.primary }} />}
                                        </button>
                                        {uploadSuccess && <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"><CheckCircle2 className="w-2.5 h-2.5 text-white" /></div>}
                                    </div>

                                    {/* Name / Role / Contact */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                            <h2 className="text-lg md:text-xl font-extrabold truncate" style={{ color: BRAND.primaryDark }}>{displayEmployeeData?.name || "N/A"}</h2>
                                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black text-white flex-shrink-0" style={{ background: BRAND.primary }}>{displayEmployeeData?.employeeCode || ""}</span>
                                        </div>
                                        <p className="text-sm font-bold mb-1" style={{ color: BRAND.primaryLight }}>{displayEmployeeData?.designation || "—"}</p>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-500">
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" style={{ color: BRAND.primary }} /> Joined {formatDate(displayEmployeeData?.dateOfJoining)}</span>
                                            {displayEmployeeData?.mobile && <span className="flex items-center gap-1"><Phone className="w-3 h-3" style={{ color: BRAND.primary }} /><a href={`tel:${displayEmployeeData.mobile}`} className="hover:underline">{displayEmployeeData.mobile}</a></span>}
                                            {displayEmployeeData?.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" style={{ color: BRAND.primary }} /><a href={`mailto:${displayEmployeeData.email}`} className="hover:underline truncate max-w-xs">{displayEmployeeData.email}</a></span>}
                                        </div>
                                    </div>

                                    {/* Buttons */}
                                    <div className="flex gap-2 ml-auto flex-shrink-0">
                                        <a href={MISS_PUNCH_FORM} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-bold shadow transition hover:opacity-90 hover:scale-105"
                                            style={{ background: `linear-gradient(135deg, ${BRAND.primaryDark}, ${BRAND.primary})` }}>
                                            <Clock className="w-3.5 h-3.5" /> Miss Punch
                                        </a>
                                        <a href={LEAVE_FORM} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-bold shadow transition hover:opacity-90 hover:scale-105"
                                            style={{ background: BRAND.accent }}>
                                            <FileText className="w-3.5 h-3.5" /> Apply Leave
                                        </a>
                                    </div>
                                </div>

                                {/* ─── ROW 2: Donut + Stats + Attendance side-by-side ─── */}
                                <div className="flex flex-wrap gap-3 items-stretch">

                                    {/* Donut Progress */}
                                    <div className="flex flex-col items-center justify-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 flex-shrink-0" style={{ minWidth: '110px' }}>
                                        <TaskCompletionPieChart
                                            achieved={parseFloat(displayEmployeeData?.totalAchievement || 0)}
                                            target={parseFloat(displayEmployeeData?.target || 1)}
                                        />
                                        <p className="text-[10px] text-gray-400 mt-1 font-semibold">Overall</p>
                                        <p className="text-base font-extrabold leading-none" style={{ color: BRAND.primary }}>{displayEmployeeData?.progressPct || 0}%</p>
                                    </div>

                                    {/* 6 Stat Tiles */}
                                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {[
                                            { label: 'Pending Today', value: displayEmployeeData?.todayTask || '0', sub: 'tasks due', color: '#f97316', bg: '#fff7ed', Icon: AlertCircle },
                                            { label: 'Total Done', value: displayEmployeeData?.totalAchievement || '0', sub: `Target: ${displayEmployeeData?.target || '0'}`, color: BRAND.primary, bg: '#f0f7e6', Icon: CheckCircle2 },
                                            { label: 'Punch Days', value: displayEmployeeData?.punchDays || '0', sub: 'days present', color: '#3b82f6', bg: '#eff6ff', Icon: Clock },
                                            { label: 'Miss Punch', value: displayEmployeeData?.missPunch || '0', sub: 'needs action', color: '#ef4444', bg: '#fef2f2', Icon: XCircle },
                                            { label: 'Week Pending', value: displayEmployeeData?.weekPending || '0', sub: 'workload', color: '#a855f7', bg: '#faf5ff', Icon: ClipboardList },
                                            { label: 'Extra Done', value: displayEmployeeData?.extraDone || '0', sub: 'above target', color: BRAND.accent, bg: '#fffbeb', Icon: TrendingUp },
                                        ].map(({ label, value, sub, color, bg, Icon }) => (
                                            <div key={label} className="rounded-xl p-3 flex flex-col justify-between transition-shadow hover:shadow-sm" style={{ background: bg, border: `1px solid ${color}22` }}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-[10px] text-gray-500 font-bold leading-tight">{label}</span>
                                                    <Icon className="w-3.5 h-3.5 flex-shrink-0 opacity-70" style={{ color }} />
                                                </div>
                                                <span className="text-xl font-extrabold leading-none" style={{ color }}>{value}</span>
                                                <span className="text-[9px] text-gray-400 mt-0.5">{sub}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* 4 Attendance Row Indicators */}
                                    <div className="flex flex-col justify-between gap-2 flex-shrink-0" style={{ minWidth: '160px' }}>
                                        {[
                                            { label: 'On Time', value: displayEmployeeData?.totalOnTime || '0', of: displayEmployeeData?.punchDays || '0', color: '#10b981' },
                                            { label: 'Late Days', value: displayEmployeeData?.lateDays || '0', of: displayEmployeeData?.punchDays || '0', color: '#f59e0b' },
                                            { label: 'Absent', value: displayEmployeeData?.absent || '0', of: null, color: '#ef4444' },
                                            { label: 'Efficiency', value: `${100 - parseFloat(displayEmployeeData?.workNotDonePct || 0)}%`, of: '100%', color: '#8b5cf6' },
                                        ].map(({ label, value, of, color }) => (
                                            <div key={label} className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100 flex-1">
                                                <div className="w-1.5 rounded-full self-stretch flex-shrink-0" style={{ background: color, minHeight: '20px' }} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] text-gray-400 font-semibold">{label}</p>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-sm font-extrabold" style={{ color }}>{value}</span>
                                                        {of && <span className="text-[9px] text-gray-400">/ {of}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* ── WELCOME BANNER ── */}
            <div className="container mx-auto px-4 py-6" id="profile">
                <div className="mb-6 rounded-xl p-6 text-white shadow-lg overflow-hidden relative transform hover:scale-105 transition-all duration-300"
                    style={{ background: `linear-gradient(135deg, ${BRAND.primaryDark} 0%, ${BRAND.primaryLight} 100%)` }}>
                    <div className="relative flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">
                                Welcome back, {displayEmployeeData?.name?.split(' ')[0] || "Team Member"}! 👋
                            </h2>
                            <p className="text-green-100 text-sm">
                                {new Date().toLocaleDateString('en-IN', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                        <div className="px-4 py-3 bg-white/20 rounded-xl text-center backdrop-blur-sm">
                            <p className="text-xs font-medium opacity-90">Total Employees</p>
                            <p className="font-bold text-2xl">{employees?.length || 306}+</p>
                        </div>
                    </div>
                </div>

                {/* About Us Section */}
                <section id="about" className="mb-10 scroll-mt-20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold" style={{ color: BRAND.primaryDark }}>PASSARY REFRACTORIES</h2>
                            <h3 className="text-xl font-semibold" style={{ color: BRAND.primary }}>Engineering Refractory Excellence Since 1990</h3>
                            <p className="text-gray-700 text-base leading-relaxed">
                                Established in 1990, Passary Refractories began its journey as a manufacturer of synthetic raw materials for refractory companies. Over the years, we have evolved into a frontrunner in developing technologically advanced and energy-efficient castables tailored for the secondary steel industry.
                            </p>
                            <p className="text-gray-700 text-base leading-relaxed">
                                As the pioneers of Mullite-Based Castables and Dual Layer Casting in India, Passary Refractories has emerged as a market leader in specialized castables for the DRI and Pellet industry.
                            </p>
                            <button className="px-6 py-3 text-white rounded-lg font-semibold text-sm transition-all hover:shadow-lg hover:scale-105 flex items-center gap-2"
                                style={{ background: `linear-gradient(135deg, ${BRAND.primaryDark}, ${BRAND.primary})` }}>
                                KNOW MORE
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="rounded-xl p-6" style={{ background: BRAND.surface }}>
                            <div className="text-center space-y-4">
                                <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center" style={{ background: BRAND.primary }}>
                                    <Factory className="w-10 h-10 text-white" />
                                </div>
                                <h4 className="text-xl font-bold" style={{ color: BRAND.primaryDark }}>Complete Refractory Solutions</h4>
                                <p className="text-gray-600">From supply to application - Your one-stop partner</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="rounded-lg p-4" style={{ background: `${BRAND.primary}20` }}>
                                        <p className="text-2xl font-bold" style={{ color: BRAND.primary }}>95%</p>
                                        <p className="text-sm text-gray-600">In-House Production</p>
                                    </div>
                                    <div className="rounded-lg p-4" style={{ background: `${BRAND.accent}20` }}>
                                        <p className="text-2xl font-bold" style={{ color: BRAND.accent }}>30+</p>
                                        <p className="text-sm text-gray-600">Years Experience</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Achievements Stats */}
                <section className="mb-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {achievements.map((item, index) => (
                            <div key={index} className="bg-white rounded-xl p-6 text-center shadow-sm border hover:shadow-md transition-all">
                                <item.icon className="w-8 h-8 mx-auto mb-2" style={{ color: item.color }} />
                                <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
                                <p className="text-sm text-gray-600">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Leadership Team */}
                <section id="leadership" className="mb-10 scroll-mt-20">
                    <div className="text-center mb-6">
                        <h2 className="text-3xl font-bold mb-2" style={{ color: BRAND.primaryDark }}>Guiding Our Journey</h2>
                        <p className="text-gray-600">Meet the visionary leaders shaping the future of refractory industry</p>
                        <div className="w-20 h-1 mx-auto mt-2 rounded-full" style={{ background: BRAND.primary }}></div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {leadershipTeam.map((leader, index) => (
                            <div key={index} className="text-center group">
                                <div className="relative mb-3">
                                    <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg group-hover:shadow-xl transition-all group-hover:scale-105">
                                        <img
                                            src={leader.image}
                                            alt={leader.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">{leader.name}</h3>
                                <p className="font-medium text-sm px-3 py-1 rounded-full inline-block" style={{ background: `${BRAND.primary}20`, color: BRAND.primary }}>{leader.role}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Latest Insights with Images */}
                <section id="insights" className="mb-10 scroll-mt-20">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-3xl font-bold" style={{ color: BRAND.primaryDark }}>Latest Insights & Updates</h2>
                            <p className="text-gray-600">Stay updated with industry trends and company news</p>
                        </div>
                        <button className="font-semibold hover:underline flex items-center gap-1" style={{ color: BRAND.primary }}>
                            View All
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {latestPosts.map((post, index) => (
                            <div key={index} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all group">
                                <div className="h-48 overflow-hidden">
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-all duration-300"
                                    />
                                </div>
                                <div className="p-5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ background: BRAND.primary }}>
                                            {post.type}
                                        </span>
                                        <span className="text-gray-500 text-sm">{post.date}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{post.title}</h3>
                                    <div className="flex items-center justify-between">
                                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">{post.category}</span>
                                        {post.author && <span className="text-gray-600 text-sm">By {post.author}</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Industry Solutions */}
                <section id="solutions" className="mb-10 scroll-mt-20">
                    <div className="text-center mb-6">
                        <h2 className="text-3xl font-bold mb-2" style={{ color: BRAND.primaryDark }}>Industry Focus Solutions</h2>
                        <p className="text-gray-600">Engineered to perform across the toughest industrial environments</p>
                        <div className="w-20 h-1 mx-auto mt-2 rounded-full" style={{ background: BRAND.primary }}></div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {industrySolutions.map((solution, index) => (
                            <div key={index} className="bg-white rounded-xl overflow-hidden border hover:shadow-lg transition-all group">
                                <div className="h-32 overflow-hidden">
                                    <img
                                        src={solution.image}
                                        alt={solution.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                </div>
                                <div className="p-3">
                                    <h3 className="font-semibold text-gray-900 text-sm text-center line-clamp-2">{solution.title}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Key Achievements */}
                <section id="achievements" className="mb-10 scroll-mt-20">
                    <div className="text-center mb-6">
                        <h2 className="text-3xl font-bold mb-2" style={{ color: BRAND.primaryDark }}>Key Achievements & Innovations</h2>
                        <div className="w-20 h-1 mx-auto rounded-full" style={{ background: BRAND.primary }}></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="rounded-2xl p-6 border border-green-100 hover:shadow-xl transition-all group overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #f0f7e6 0%, #e8f5d0 100%)' }}>
                            <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10" style={{ background: BRAND.primary }}></div>
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-sm" style={{ background: BRAND.primary }}>
                                <Factory className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-xl font-bold mb-2" style={{ color: BRAND.primaryDark }}>Manufacturing Leap</h3>
                            <p className="text-gray-700">
                                Ventured into castables, achieving <span className="font-bold" style={{ color: BRAND.primary }}>95% in-house production</span> capability.
                            </p>
                        </div>

                        <div className="rounded-2xl p-6 border border-blue-100 hover:shadow-xl transition-all group overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' }}>
                            <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10 bg-blue-600"></div>
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-sm bg-blue-600">
                                <Award className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-blue-900 mb-2">Mullite's Indian Debut</h3>
                            <p className="text-gray-700">
                                Pioneered <span className="font-bold text-blue-600">Mullite-based refractories</span> in India, breaking import dependency.
                            </p>
                        </div>

                        <div className="rounded-2xl p-6 border border-yellow-100 hover:shadow-xl transition-all group overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)' }}>
                            <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10" style={{ background: BRAND.accent }}></div>
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-sm" style={{ background: BRAND.accent }}>
                                <TrendingUp className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-xl font-bold mb-2" style={{ color: '#92400e' }}>The Casting Shift</h3>
                            <p className="text-gray-700">
                                Introduced <span className="font-bold" style={{ color: BRAND.accent }}>dual-layer refractor</span> in rotary kilns—our flagship innovation.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Timeline with Icons */}
                <section id="milestones" className="mb-10 scroll-mt-20">
                    <div className="text-center mb-6">
                        <h2 className="text-3xl font-bold mb-2" style={{ color: BRAND.primaryDark }}>Our Journey Through Time</h2>
                        <p className="text-gray-600">From humble beginnings to industry leadership</p>
                        <div className="w-20 h-1 mx-auto mt-2 rounded-full" style={{ background: BRAND.primary }}></div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {milestones.map((milestone, index) => {
                            const Icon = milestone.icon;
                            const milestoneColors = ['#6B8E23', '#DAA520', '#3b82f6', '#8b5cf6', '#f97316', '#10b981'];
                            const c = milestoneColors[index % milestoneColors.length];
                            return (
                                <div key={index} className="bg-white p-5 rounded-2xl border hover:shadow-xl transition-all group cursor-default" style={{ borderLeft: `4px solid ${c}` }}>
                                    <div className="flex items-start gap-3">
                                        <div className="p-3 rounded-xl flex-shrink-0" style={{ background: `${c}18` }}>
                                            <Icon className="w-5 h-5" style={{ color: c }} />
                                        </div>
                                        <div>
                                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white inline-block mb-2" style={{ background: c }}>
                                                {milestone.year}
                                            </span>
                                            <h4 className="text-base font-bold text-gray-900 mb-1">{milestone.title}</h4>
                                            <p className="text-gray-600 text-xs leading-relaxed">{milestone.description}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Core Values Grid */}
                <section id="values" className="mb-10 scroll-mt-20">
                    <div className="text-center mb-6">
                        <h2 className="text-3xl font-bold mb-2" style={{ color: BRAND.primaryDark }}>Our Core Values</h2>
                        <p className="text-gray-600">The principles that guide our journey and define our legacy</p>
                        <div className="w-20 h-1 mx-auto mt-2 rounded-full" style={{ background: BRAND.primary }}></div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {values.map((value, index) => (
                            <div key={index} className="bg-white rounded-2xl p-4 border hover:shadow-xl transition-all group text-center hover:-translate-y-1 duration-200">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 mx-auto transition-all group-hover:scale-110 group-hover:shadow-md ${value.color}`}>
                                    {value.icon}
                                </div>
                                <h3 className="text-sm font-extrabold text-gray-900 mb-1">{value.title}</h3>
                                <p className="text-gray-500 text-[11px] leading-snug">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Stats with gradient background */}
                <div className="mb-10 rounded-xl p-8 text-white shadow-xl" style={{ background: `linear-gradient(135deg, ${BRAND.primaryDark} 0%, ${BRAND.primaryLight} 100%)` }}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold mb-1">{employees?.length || 306}+</div>
                            <p className="text-green-100">Employees</p>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold mb-1">30+</div>
                            <p className="text-green-100">Years Experience</p>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold mb-1">95%</div>
                            <p className="text-green-100">In-House Production</p>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold mb-1">50+</div>
                            <p className="text-green-100">Countries Served</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Footer with Social Media */}
            <footer id="contact" className="bg-black text-white pt-12 pb-6 scroll-mt-20">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center mb-4">
                                <img src={logo} alt="Passary Refractories" className="h-10 w-auto mr-3" />
                                <div>
                                    <h3 className="text-xl font-bold">Passary Refractories</h3>
                                    <p className="text-gray-400 text-sm">Since 1990</p>
                                </div>
                            </div>
                            <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                                We're saving over <span className="font-bold text-white">1.5 lakh tons of coal energy</span> through innovative refractory solutions.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-gray-800 rounded-full text-xs">Make in India</span>
                                <span className="px-3 py-1 bg-gray-800 rounded-full text-xs">Energy Efficient</span>
                                <span className="px-3 py-1 bg-gray-800 rounded-full text-xs">Sustainable</span>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-lg font-semibold mb-4 text-gray-300">Contact Us</h4>
                            <div className="space-y-3">
                                <div className="flex items-start">
                                    <PhoneIcon className="w-5 h-5 mt-0.5 mr-3 text-gray-400 flex-shrink-0" />
                                    <span className="text-gray-300 text-sm">+7222980807</span>
                                </div>
                                <div className="flex items-start">
                                    <MailIcon className="w-5 h-5 mt-0.5 mr-3 text-gray-400 flex-shrink-0" />
                                    <span className="text-gray-300 text-sm">pmmpl@pasmin.com</span>
                                </div>
                                <div className="flex items-start">
                                    <MapPinIcon className="w-5 h-5 mt-0.5 mr-3 text-gray-400 flex-shrink-0" />
                                    <span className="text-gray-300 text-sm">Shriram Business Park, Block-C, 2nd Floor, Shop No - 217,218, Vidhansabha Road, Near Swarnabhoomi, Raipur, Pin- 493111, Chhattisgarh, India.</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-lg font-semibold mb-4 text-gray-300">Our Products</h4>
                            <ul className="space-y-2">
                                {['Shaped Refractories', 'Unshaped Refractories', 'Insulating Refractories', 'Speciality Refractories'].map((product, idx) => (
                                    <li key={idx} className="flex items-center">
                                        <div className="w-1.5 h-1.5 rounded-full mr-2" style={{ background: BRAND.primary }}></div>
                                        <span className="text-gray-300 text-sm hover:text-white transition cursor-pointer">{product}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-lg font-semibold mb-4 text-gray-300">Follow Us</h4>
                            <div className="flex space-x-3 mb-4">
                                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition">
                                    <Facebook className="w-5 h-5" />
                                </a>
                                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition">
                                    <Twitter className="w-5 h-5" />
                                </a>
                                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition">
                                    <Linkedin className="w-5 h-5" />
                                </a>
                                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition">
                                    <Instagram className="w-5 h-5" />
                                </a>
                            </div>
                            <h4 className="text-lg font-semibold mb-3 text-gray-300">Our Location</h4>
                            <div className="rounded-lg overflow-hidden">
                                <iframe
                                    src="https://www.google.com/maps?q=21.282988041931297,81.70320181892319&hl=en&z=16&output=embed"
                                    width="100%"
                                    height="120"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Google Map Location"
                                    className="rounded"
                                ></iframe>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 pt-6 mt-6">
                        <div className="flex flex-col md:flex-row justify-between items-center">
                            <div className="text-center md:text-left">
                                <p className="text-gray-400 text-sm">
                                    &copy; {new Date().getFullYear()} Passary Refractories. All rights reserved.
                                </p>
                                <p className="text-gray-500 text-xs mt-1">
                                    Pioneering refractory solutions since 1990 • Making India self-reliant in refractory technology
                                </p>
                            </div>
                            <div className="mt-2 md:mt-0">
                                <p className="text-gray-400 text-sm">
                                    Powered by{" "}
                                    <a href="https://botivate.in/" className="text-white hover:underline font-medium">
                                        Botivate
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div >
    );
};

export default HomePage;