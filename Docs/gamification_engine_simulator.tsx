import React, { useState, useEffect, useMemo } from 'react';

// --- DANH SÁCH DỮ LIỆU BAN ĐẦU ---
const INITIAL_USERS = [
  { id: 'u1', name: 'Nguyễn Văn Anh', level: 'Vàng', orderCount: 8, revenue: 4200000, points: 450, badges: ['b1'], titles: ['Chiến Binh Đồng Hành'] },
  { id: 'u2', name: 'Trần Thị Bình', level: 'Kim Cương', orderCount: 25, revenue: 15600000, points: 1850, badges: ['b1', 'b2', 'b3'], titles: ['Đại Phú Hộ', 'Thành Viên Tận Tụy'] },
  { id: 'u3', name: 'Lê Hoàng Cường', level: 'Bạc', orderCount: 3, revenue: 1200000, points: 120, badges: [], titles: [] },
  { id: 'u4', name: 'Phạm Minh Đức', level: 'Đồng', orderCount: 1, revenue: 350000, points: 35, badges: [], titles: [] },
  { id: 'u5', name: 'Đặng Hồng Hạnh', level: 'Vàng', orderCount: 12, revenue: 6800000, points: 720, badges: ['b1', 'b2'], titles: ['Chiến Binh Đồng Hành'] },
];

const BADGES_DEFINITION = {
  b1: { id: 'b1', name: 'Khởi Đầu Thuận Lợi', desc: 'Có đơn hàng đầu tiên thành công', icon: '🌱', color: 'from-emerald-400 to-teal-600' },
  b2: { id: 'b2', name: 'Khách Hàng Thân Thiết', desc: 'Đạt mốc 10 đơn hàng trở lên', icon: '🤝', color: 'from-blue-400 to-indigo-600' },
  b3: { id: 'b3', name: 'Đại Phú Hộ', desc: 'Tổng chi tiêu vượt quá 10,000,000 đ', icon: '👑', color: 'from-amber-400 to-yellow-600' },
  b4: { id: 'b4', name: 'Thượng Khách Kim Cương', desc: 'Đạt cấp bậc thành viên Kim Cương', icon: '💎', color: 'from-purple-400 to-pink-600' },
};

const INITIAL_RULES = [
  { id: 'r1', name: 'Luật Đơn Hàng Đầu Tiên', trigger: 'Đơn hàng', condition: 'Số lượng đơn >= 1', action: 'Tặng Huy hiệu "Khởi Đầu Thuận Lợi" & +50 điểm', active: true },
  { id: 'r2', name: 'Luật Khách Thân Thiết', trigger: 'Đơn hàng', condition: 'Số lượng đơn >= 10', action: 'Tặng Huy hiệu "Khách Hàng Thân Thiết" & +200 điểm', active: true },
  { id: 'r3', name: 'Luật Đại Phú Hộ', trigger: 'Doanh thu', condition: 'Doanh thu >= 10,000,000 đ', action: 'Tặng Huy hiệu "Đại Phú Hộ", Danh hiệu "VIP Chi Tiêu" & +500 điểm', active: true },
  { id: 'r4', name: 'Luật Thăng Cấp Kim Cương', trigger: 'Cấp thành viên', condition: 'Bậc = Kim Cương', action: 'Tặng Huy hiệu "Thượng Khách Kim Cương" & Gửi Bằng Khen Danh Dự', active: true },
];

export default function App() {
  // --- QUẢN LÝ TRẠNG THÁI (STATE) ---
  const [users, setUsers] = useState(INITIAL_USERS);
  const [rules, setRules] = useState(INITIAL_RULES);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'app', user: 'Trần Thị Bình', message: 'đã đạt danh hiệu "Đại Phú Hộ"!', time: '10 phút trước' },
    { id: 2, type: 'badge', user: 'Nguyễn Văn Anh', message: 'được trao Huy hiệu "Khởi Đầu Thuận Lợi"', time: '25 phút trước' },
  ]);
  const [activeTab, setActiveTab] = useState('diagram'); // diagram | leaderboard | rules | simulator
  
  // Trạng thái cho Form giả lập sự kiện
  const [simUserId, setSimUserId] = useState('u1');
  const [simOrderAmount, setSimOrderAmount] = useState('500000');
  const [simNewLevel, setSimNewLevel] = useState('Đồng');
  
  // Trạng thái xem Bằng khen ảo (Certificate Modal)
  const [selectedCert, setSelectedCert] = useState(null);

  // Thống kê nhanh toàn hệ thống
  const systemStats = useMemo(() => {
    const totalRev = users.reduce((acc, u) => acc + u.revenue, 0);
    const totalOrders = users.reduce((acc, u) => acc + u.orderCount, 0);
    const totalBadgesEarned = users.reduce((acc, u) => acc + u.badges.length, 0);
    return { totalRev, totalOrders, totalBadgesEarned };
  }, [users]);

  // Luồng dữ liệu hoạt động của hệ thống (Animation / Log)
  const [engineFlowState, setEngineFlowState] = useState({
    activeInput: null, // 'order' | 'revenue' | 'level'
    evaluating: false,
    triggeredOutput: null, // 'badge' | 'title' | 'leaderboard'
    notificationSent: false
  });

  // --- BỘ XỬ LÝ SỰ KIỆN (SIMULATION LOGIC) ---
  const triggerSimulation = (type, payload) => {
    // Kích hoạt hiệu ứng visual trên Sơ đồ hệ thống
    setEngineFlowState({
      activeInput: type,
      evaluating: true,
      triggeredOutput: null,
      notificationSent: false
    });

    // Tạo độ trễ ngắn để mô phỏng tiến trình xử lý của Rule Engine
    setTimeout(() => {
      setUsers(prevUsers => {
        return prevUsers.map(user => {
          if (user.id !== payload.userId) return user;

          let updatedUser = { ...user };
          const newNotifications = [];

          if (type === 'order') {
            const amount = parseFloat(payload.amount);
            updatedUser.orderCount += 1;
            updatedUser.revenue += amount;
            // Tính điểm: 10% giá trị đơn hàng quy ra điểm (đơn vị nghìn đồng)
            const addedPoints = Math.floor(amount / 10000);
            updatedUser.points += addedPoints;

            // Đánh giá các luật liên quan đến Đơn hàng & Doanh thu
            // Luật 1: Khởi Đầu Thuận Lợi
            if (updatedUser.orderCount >= 1 && !updatedUser.badges.includes('b1')) {
              updatedUser.badges = [...updatedUser.badges, 'b1'];
              updatedUser.points += 50;
              newNotifications.push({
                id: Date.now() + 1,
                type: 'badge',
                user: updatedUser.name,
                message: 'được trao Huy hiệu "Khởi Đầu Thuận Lợi" (+50 điểm)',
                time: 'Vừa xong'
              });
            }
            // Luật 2: Khách Thân Thiết
            if (updatedUser.orderCount >= 10 && !updatedUser.badges.includes('b2')) {
              updatedUser.badges = [...updatedUser.badges, 'b2'];
              updatedUser.points += 200;
              newNotifications.push({
                id: Date.now() + 2,
                type: 'badge',
                user: updatedUser.name,
                message: 'được trao Huy hiệu "Khách Hàng Thân Thiết" (+200 điểm)',
                time: 'Vừa xong'
              });
            }
            // Luật 3: Đại Phú Hộ
            if (updatedUser.revenue >= 10000000 && !updatedUser.badges.includes('b3')) {
              updatedUser.badges = [...updatedUser.badges, 'b3'];
              updatedUser.points += 500;
              if (!updatedUser.titles.includes('Đại Phú Hộ')) {
                updatedUser.titles = [...updatedUser.titles, 'Đại Phú Hộ'];
              }
              newNotifications.push({
                id: Date.now() + 3,
                type: 'certificate',
                user: updatedUser.name,
                message: 'đạt danh hiệu cao quý "Đại Phú Hộ"! Nhấn để xem Bằng Khen.',
                time: 'Vừa xong',
                certDetails: {
                  name: updatedUser.name,
                  title: 'Đại Phú Hộ',
                  reason: 'Có tổng chi tiêu tích lũy vượt mốc 10.000.000 VNĐ tại hệ thống.',
                  date: new Date().toLocaleDateString('vi-VN')
                }
              });
            }
          } else if (type === 'level') {
            updatedUser.level = payload.newLevel;

            // Luật 4: Thăng Cấp Kim Cương
            if (payload.newLevel === 'Kim Cương' && !updatedUser.badges.includes('b4')) {
              updatedUser.badges = [...updatedUser.badges, 'b4'];
              newNotifications.push({
                id: Date.now() + 4,
                type: 'certificate',
                user: updatedUser.name,
                message: 'đạt Cấp bậc Kim Cương tôn quý! Nhận Bằng Khen ngay.',
                time: 'Vừa xong',
                certDetails: {
                  name: updatedUser.name,
                  title: 'Thượng Khách Kim Cương',
                  reason: 'Đạt cấp bậc thành viên tối cao Kim Cương của niên khóa dịch vụ.',
                  date: new Date().toLocaleDateString('vi-VN')
                }
              });
            }
          }

          if (newNotifications.length > 0) {
            setNotifications(prev => [...newNotifications, ...prev]);
            // Cập nhật trạng thái đầu ra của sơ đồ
            setEngineFlowState(f => ({
              ...f,
              triggeredOutput: newNotifications[0].type === 'certificate' ? 'title' : 'badge',
              notificationSent: true
            }));
          } else {
            setEngineFlowState(f => ({
              ...f,
              triggeredOutput: 'leaderboard',
              notificationSent: true
            }));
          }

          return updatedUser;
        });
      });

      // Tắt trạng thái đang xử lý sau khi hoàn tất các hoạt ảnh động
      setTimeout(() => {
        setEngineFlowState(f => ({ ...f, evaluating: false }));
      }, 1500);

    }, 1000);
  };

  // Sắp xếp danh sách bảng xếp hạng theo điểm số giảm dần
  const leaderboardData = useMemo(() => {
    return [...users].sort((a, b) => b.points - a.points);
  }, [users]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      {/* HEADER BAR */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-amber-500 to-orange-600 p-2 rounded-xl shadow-lg shadow-orange-500/20">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-amber-400 bg-clip-text text-transparent">
                Hệ Thống Gamification Engine
              </h1>
              <p className="text-xs text-slate-400">Kiến trúc đánh giá Luật & Tương tác Khách hàng thời gian thực</p>
            </div>
          </div>
          
          {/* Menu Điều Hướng */}
          <nav className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button 
              onClick={() => setActiveTab('diagram')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === 'diagram' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Sơ Đồ Luồng
            </button>
            <button 
              onClick={() => setActiveTab('simulator')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === 'simulator' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Bảng Giả Lập
            </button>
            <button 
              onClick={() => setActiveTab('leaderboard')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === 'leaderboard' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Bảng Xếp Hạng
            </button>
            <button 
              onClick={() => setActiveTab('rules')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === 'rules' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Cơ Sở Luật
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* PANEL TRÁI: KHU VỰC TƯƠNG TÁC CHÍNH (8 CỘT) */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Thẻ Thống kê nhanh */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800/60 p-4 rounded-xl flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">💵</div>
              <div>
                <span className="block text-xs text-slate-400">Doanh thu giả lập</span>
                <span className="font-mono text-base md:text-lg font-bold">{(systemStats.totalRev).toLocaleString('vi-VN')}đ</span>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800/60 p-4 rounded-xl flex items-center gap-3">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">📦</div>
              <div>
                <span className="block text-xs text-slate-400">Tổng số đơn hàng</span>
                <span className="font-mono text-base md:text-lg font-bold">{systemStats.totalOrders} đơn</span>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800/60 p-4 rounded-xl flex items-center gap-3">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg">🏆</div>
              <div>
                <span className="block text-xs text-slate-400">Huy hiệu đã đạt</span>
                <span className="font-mono text-base md:text-lg font-bold">{systemStats.totalBadgesEarned} chiếc</span>
              </div>
            </div>
          </div>

          {/* TAB 1: SƠ ĐỒ ĐỘNG CỦA KIẾN TRÚC GAMIFICATION */}
          {activeTab === 'diagram' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-slate-950 px-3 py-1 rounded-full border border-slate-800 text-[10px] text-slate-400 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${engineFlowState.evaluating ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`}></span>
                {engineFlowState.evaluating ? 'Đang phân tích luật...' : 'Hệ thống Sẵn sàng'}
              </div>

              <h2 className="text-lg font-bold text-slate-100 mb-2 flex items-center gap-2">
                <span>🔄 Sơ đồ luồng Kiến trúc Động</span>
              </h2>
              <p className="text-xs text-slate-400 mb-6">Mô phỏng đường truyền tín hiệu từ Đầu vào sự kiện qua Bộ xử lý đến Kết quả phần thưởng</p>

              {/* KHU VỰC VẼ SƠ ĐỒ BẰNG SVG & FLEX */}
              <div className="flex flex-col items-center justify-center gap-10 py-6 min-h-[380px]">
                
                {/* 1. LAYER ĐẦU VÀO (INPUT EVENTS) */}
                <div className="grid grid-cols-3 gap-4 w-full max-w-lg z-10">
                  <div className={`p-4 rounded-xl border transition-all text-center ${engineFlowState.activeInput === 'order' ? 'bg-amber-500/20 border-amber-500 scale-105 shadow-lg shadow-amber-500/10' : 'bg-slate-950 border-slate-800'}`}>
                    <div className="text-2xl mb-1">📦</div>
                    <div className="font-bold text-xs">Đơn Hàng</div>
                    <div className="text-[10px] text-slate-500 mt-1">Triggers: Số lượng đơn</div>
                  </div>
                  
                  <div className={`p-4 rounded-xl border transition-all text-center ${engineFlowState.activeInput === 'revenue' ? 'bg-indigo-500/20 border-indigo-500 scale-105 shadow-lg shadow-indigo-500/10' : 'bg-slate-950 border-slate-800'}`}>
                    <div className="text-2xl mb-1">💵</div>
                    <div className="font-bold text-xs">Doanh Thu</div>
                    <div className="text-[10px] text-slate-500 mt-1">Triggers: Tổng chi tiêu</div>
                  </div>

                  <div className={`p-4 rounded-xl border transition-all text-center ${engineFlowState.activeInput === 'level' ? 'bg-purple-500/20 border-purple-500 scale-105 shadow-lg shadow-purple-500/10' : 'bg-slate-950 border-slate-800'}`}>
                    <div className="text-2xl mb-1">💎</div>
                    <div className="font-bold text-xs">Cấp Thành Viên</div>
                    <div className="text-[10px] text-slate-500 mt-1">Triggers: Phân hạng vip</div>
                  </div>
                </div>

                {/* DÂY NỐI XUỐNG BỘ ENGINE */}
                <div className="h-6 w-0.5 bg-gradient-to-b from-slate-700 to-amber-500 relative">
                  {engineFlowState.evaluating && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-amber-400 rounded-full animate-bounce"></div>
                  )}
                </div>

                {/* 2. LAYER TRUNG TÂM (RULE EVALUATION ENGINE) */}
                <div className={`w-full max-w-md p-5 rounded-2xl border transition-all duration-300 text-center relative z-10 ${engineFlowState.evaluating ? 'bg-gradient-to-r from-amber-600/30 to-orange-600/30 border-amber-500 scale-102 ring-4 ring-amber-500/10' : 'bg-slate-950/90 border-slate-700'}`}>
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 px-3 py-0.5 rounded-full text-[10px] uppercase font-mono tracking-wider text-slate-300">
                    Trọng Tâm Hệ Thống
                  </div>
                  <div className="flex items-center justify-center gap-3 mb-1">
                    <span className="text-xl animate-spin" style={{ animationDuration: engineFlowState.evaluating ? '2s' : '8s' }}>⚙️</span>
                    <h3 className="font-bold text-sm tracking-wide text-amber-400">Rule Evaluation Engine</h3>
                  </div>
                  <p className="text-xs text-slate-400">Liên tục quét dữ liệu đầu vào và đối sánh với {rules.length} Luật hệ thống</p>
                  
                  {/* Trạng thái quét luật */}
                  {engineFlowState.evaluating && (
                    <div className="mt-2 text-[10px] text-amber-300 animate-pulse font-mono">
                      {"CHECKING: rules_list.match(events) == TRUE -> Trực quan hóa phần thưởng..."}
                    </div>
                  )}
                </div>

                {/* DÂY NỐI XUỐNG LAYER PHẦN THƯỞNG */}
                <div className="h-6 w-0.5 bg-gradient-to-b from-amber-500 to-slate-700 relative"></div>

                {/* 3. LAYER GAMIFICATION OUTPUTS */}
                <div className="grid grid-cols-3 gap-4 w-full max-w-xl z-10">
                  <div className={`p-4 rounded-xl border transition-all text-center ${engineFlowState.triggeredOutput === 'badge' ? 'bg-emerald-500/20 border-emerald-500 scale-105 shadow-md shadow-emerald-500/15' : 'bg-slate-950 border-slate-800'}`}>
                    <div className="text-2xl mb-1">🏆</div>
                    <div className="font-bold text-xs">Huy Hiệu (Achievement)</div>
                    <div className="text-[10px] text-slate-500 mt-1">Hệ thống mở khóa danh hiệu</div>
                  </div>

                  <div className={`p-4 rounded-xl border transition-all text-center ${engineFlowState.triggeredOutput === 'title' ? 'bg-amber-500/20 border-amber-500 scale-105 shadow-md shadow-amber-500/15' : 'bg-slate-950 border-slate-800'}`}>
                    <div className="text-2xl mb-1">🎗️</div>
                    <div className="font-bold text-xs">Danh Hiệu (Competition)</div>
                    <div className="text-[10px] text-slate-500 mt-1">Phần thưởng thi đua cấp cao</div>
                  </div>

                  <div className={`p-4 rounded-xl border transition-all text-center ${engineFlowState.triggeredOutput === 'leaderboard' ? 'bg-blue-500/20 border-blue-500 scale-105 shadow-md shadow-blue-500/15' : 'bg-slate-950 border-slate-800'}`}>
                    <div className="text-2xl mb-1">📊</div>
                    <div className="font-bold text-xs">Bảng Xếp Hạng</div>
                    <div className="text-[10px] text-slate-500 mt-1">Cập nhật điểm & thứ hạng</div>
                  </div>
                </div>

                {/* DÂY NỐI CUỐI - NOTIFICATION ENGINE */}
                <div className="h-6 w-0.5 bg-gradient-to-b from-slate-700 to-red-500"></div>

                {/* 4. NOTIFICATION ENGINE */}
                <div className={`w-full max-w-sm p-4 rounded-xl border text-center transition-all ${engineFlowState.notificationSent ? 'bg-red-500/10 border-red-500/70 scale-102' : 'bg-slate-950 border-slate-800'}`}>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="text-lg">🔔</span>
                    <h4 className="font-bold text-xs text-red-400">Notification Engine (Bộ phát thông báo)</h4>
                  </div>
                  <div className="flex justify-center gap-2 mt-2 text-[9px] text-slate-400">
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">Push</span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">In-App</span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">Bằng Khen (Cert)</span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">Khoe Huy Hiệu</span>
                  </div>
                </div>

              </div>

              {/* Hướng dẫn nhanh bên dưới sơ đồ */}
              <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                <p className="font-bold mb-1 text-amber-400">💡 Hướng dẫn vận hành dòng chảy:</p>
                Chuyển qua tab <strong>"Bảng Giả Lập"</strong> bên cạnh để bắn một Đơn Hàng mới hoặc Thay đổi Cấp bậc thành viên. Quay lại tab này để nhìn dòng chảy dữ liệu di chuyển trực tiếp trong hệ thống theo cơ chế tự động hóa!
              </div>
            </div>
          )}

          {/* TAB 2: KHU VỰC GIẢ LẬP SỰ KIỆN (SIMULATOR) */}
          {activeTab === 'simulator' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-slate-100 mb-2 flex items-center gap-2">
                <span>⚡ Bảng Giả Lập Sự Kiện Thực Tế</span>
              </h2>
              <p className="text-xs text-slate-400 mb-6">Cung cấp sự kiện đầu vào để kiểm tra tính chính xác của Bộ đánh giá luật (Rule Engine)</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Hành động 1: Tạo Đơn hàng mới */}
                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono mb-3 uppercase">
                      Hành vi 1: Đơn Hàng Mới
                    </span>
                    <h3 className="text-sm font-bold text-slate-200 mb-2">Simulate New Order</h3>
                    <p className="text-xs text-slate-400 mb-4">Mô phỏng khách hàng thanh toán thành công đơn hàng. Hệ thống tự động ghi nhận doanh thu & tính điểm thưởng.</p>
                    
                    <div className="space-y-3 mb-6">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Khách hàng thực hiện:</label>
                        <select 
                          value={simUserId} 
                          onChange={(e) => setSimUserId(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                        >
                          {users.map(u => (
                            <option key={u.id} value={u.id}>{u.name} (Đang có {u.orderCount} đơn - {u.points}đ)</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Giá trị đơn hàng (VNĐ):</label>
                        <select 
                          value={simOrderAmount} 
                          onChange={(e) => setSimOrderAmount(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                        >
                          <option value="200000">200,000 đ (Đơn nhỏ thường)</option>
                          <option value="1500000">1,500,000 đ (Đơn giá trị vừa)</option>
                          <option value="5500000">5,500,000 đ (Đơn hàng lớn VIP)</option>
                          <option value="11000000">11,000,000 đ (Đại đơn cực khủng)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => triggerSimulation('order', { userId: simUserId, amount: simOrderAmount })}
                    disabled={engineFlowState.evaluating}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-bold py-2 rounded-lg text-xs transition duration-200 shadow-md flex items-center justify-center gap-2 disabled:opacity-55"
                  >
                    <span>{engineFlowState.evaluating ? '🔄 Đang xử lý phát thưởng...' : '🚀 Bắn sự kiện Đơn Hàng'}</span>
                  </button>
                </div>

                {/* Hành động 2: Thăng hạng Cấp bậc Thành viên */}
                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-mono mb-3 uppercase">
                      Hành vi 2: Đổi Cấp Thành Viên
                    </span>
                    <h3 className="text-sm font-bold text-slate-200 mb-2">Simulate Member Level Update</h3>
                    <p className="text-xs text-slate-400 mb-4">Điều chỉnh bằng tay cấp độ thành viên để kiểm tra các chính sách đặc quyền tối cao của Thượng khách.</p>
                    
                    <div className="space-y-3 mb-6">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Khách hàng thay đổi:</label>
                        <select 
                          value={simUserId} 
                          onChange={(e) => setSimUserId(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                        >
                          {users.map(u => (
                            <option key={u.id} value={u.id}>{u.name} (Bậc hiện tại: {u.level})</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Cập nhật lên Cấp bậc:</label>
                        <div className="grid grid-cols-4 gap-2">
                          {['Đồng', 'Bạc', 'Vàng', 'Kim Cương'].map(lvl => (
                            <button
                              key={lvl}
                              type="button"
                              onClick={() => setSimNewLevel(lvl)}
                              className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${simNewLevel === lvl ? 'bg-purple-500/20 border-purple-500 text-purple-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                            >
                              {lvl}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => triggerSimulation('level', { userId: simUserId, newLevel: simNewLevel })}
                    disabled={engineFlowState.evaluating}
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-2 rounded-lg text-xs transition duration-200 shadow-md flex items-center justify-center gap-2 disabled:opacity-55"
                  >
                    <span>{engineFlowState.evaluating ? '🔄 Đang xử lý thăng bậc...' : '⭐ Cập nhật Cấp Thành Viên'}</span>
                  </button>
                </div>

              </div>

              {/* Bảng liệt kê thành viên hiện thời bên dưới bộ giả lập */}
              <div className="mt-6">
                <h3 className="text-xs font-bold text-slate-300 mb-3 uppercase tracking-wider">Danh sách thành viên thực tế (Tĩnh)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-400">
                    <thead className="bg-slate-950 text-slate-300 uppercase font-mono text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="p-3">Họ và Tên</th>
                        <th className="p-3">Cấp Bậc</th>
                        <th className="p-3 text-right">Đơn hàng</th>
                        <th className="p-3 text-right">Tích lũy chi tiêu</th>
                        <th className="p-3 text-right">Điểm hệ thống</th>
                        <th className="p-3 text-center">Huy hiệu đã nhận</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {users.map(u => (
                        <tr key={u.id} className="hover:bg-slate-800/20 transition-all">
                          <td className="p-3 font-semibold text-slate-200">{u.name}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.level === 'Kim Cương' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                              u.level === 'Vàng' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                              u.level === 'Bạc' ? 'bg-slate-400/10 text-slate-300 border border-slate-400/20' :
                              'bg-orange-700/10 text-orange-400 border border-orange-700/20'
                            }`}>
                              {u.level}
                            </span>
                          </td>
                          <td className="p-3 text-right font-mono">{u.orderCount}</td>
                          <td className="p-3 text-right font-mono">{(u.revenue).toLocaleString('vi-VN')} đ</td>
                          <td className="p-3 text-right font-mono text-amber-400 font-bold">{u.points} PTS</td>
                          <td className="p-3">
                            <div className="flex justify-center gap-1">
                              {u.badges.length === 0 ? <span className="text-slate-600">-</span> : u.badges.map(bId => (
                                <span 
                                  key={bId} 
                                  title={BADGES_DEFINITION[bId]?.name} 
                                  className="cursor-help text-base"
                                >
                                  {BADGES_DEFINITION[bId]?.icon}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BẢNG XẾP HẠNG THỜI GIAN THỰC (LEADERBOARD) */}
          {activeTab === 'leaderboard' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <span>👑 Bảng Xếp Hạng Đua Top Tích Điểm</span>
                  </h2>
                  <p className="text-xs text-slate-400">Tự động sắp xếp vị trí dựa trên điểm số nhận được từ bộ luật gamification</p>
                </div>
                <div className="bg-slate-950 px-3 py-1 rounded-full text-xs text-slate-300 border border-slate-800">
                  Tổng thi đua: <span className="text-amber-400 font-bold font-mono">{users.length}</span> người
                </div>
              </div>

              <div className="space-y-3">
                {leaderboardData.map((user, index) => {
                  const isTop1 = index === 0;
                  const isTop2 = index === 1;
                  const isTop3 = index === 2;

                  return (
                    <div 
                      key={user.id}
                      className={`p-4 rounded-xl border flex items-center justify-between transition-all duration-300 ${
                        isTop1 ? 'bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-slate-900 border-amber-500/60 shadow-lg shadow-amber-500/5' :
                        isTop2 ? 'bg-slate-900/90 border-slate-700' :
                        'bg-slate-950/60 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Thứ hạng bằng Số hoặc Icon Vương miện */}
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                          {isTop1 && <span className="text-2xl" title="Hạng 1">🥇</span>}
                          {isTop2 && <span className="text-2xl" title="Hạng 2">🥈</span>}
                          {isTop3 && <span className="text-2xl" title="Hạng 3">🥉</span>}
                          {!isTop1 && !isTop2 && !isTop3 && <span className="text-slate-500 font-mono">#{index + 1}</span>}
                        </div>

                        {/* Thông tin cá nhân */}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-100">{user.name}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              user.level === 'Kim Cương' ? 'bg-purple-500/10 text-purple-300' :
                              user.level === 'Vàng' ? 'bg-amber-500/10 text-amber-300' :
                              'bg-slate-800 text-slate-400'
                            }`}>
                              {user.level}
                            </span>
                          </div>
                          
                          {/* Danh hiệu đặc biệt (Titles) */}
                          <div className="flex flex-wrap gap-1 mt-1">
                            {user.titles.map((t, idx) => (
                              <span key={idx} className="text-[10px] text-amber-500 font-medium">
                                🎖️ {t}
                              </span>
                            ))}
                            {user.badges.map(bId => (
                              <span key={bId} className="text-[10px] bg-slate-800 text-slate-300 px-1 py-0.2 rounded" title={BADGES_DEFINITION[bId]?.name}>
                                {BADGES_DEFINITION[bId]?.icon} {BADGES_DEFINITION[bId]?.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Điểm tích lũy */}
                      <div className="text-right">
                        <span className="block text-sm font-black font-mono text-amber-400">{user.points}</span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Points</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: DANH SÁCH LUẬT HỆ THỐNG CỦA ENGINE (RULES CONFIG) */}
          {activeTab === 'rules' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <span>⚙️ Cấu Hình Bộ Đánh Giá Luật</span>
                  </h2>
                  <p className="text-xs text-slate-400">Các quy tắc logic để biến dữ liệu hoạt động người dùng thành phần thưởng gamification</p>
                </div>
                <button 
                  onClick={() => {
                    // Reset rules về ban đầu
                    setRules(INITIAL_RULES);
                  }}
                  className="px-3 py-1 bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 rounded-lg transition-all"
                >
                  Khôi phục mặc định
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rules.map((rule) => (
                  <div key={rule.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h3 className="font-bold text-xs text-slate-200">{rule.name}</h3>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                          rule.trigger === 'Đơn hàng' ? 'bg-amber-500/10 text-amber-400' :
                          rule.trigger === 'Doanh thu' ? 'bg-indigo-500/10 text-indigo-400' :
                          'bg-purple-500/10 text-purple-400'
                        }`}>
                          {rule.trigger}
                        </span>
                      </div>

                      <div className="space-y-1.5 my-3 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Điều kiện:</span>
                          <span className="text-slate-300 font-mono">{rule.condition}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Hành động:</span>
                          <span className="text-amber-400 font-medium text-right max-w-[200px]">{rule.action}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-900/80 pt-3 mt-2 flex justify-between items-center">
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span> Đang hoạt động
                      </span>
                      <button 
                        onClick={() => {
                          // Bật tắt hoạt động của luật giả lập
                          setRules(prev => prev.map(r => r.id === rule.id ? { ...r, active: !r.active } : r));
                        }}
                        className="text-[10px] text-slate-500 hover:text-slate-300 underline"
                      >
                        {rule.active ? 'Vô hiệu hóa' : 'Kích hoạt lại'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </section>

        {/* PANEL PHẢI: FEED THÔNG BÁO VÀ KHO HUY HIỆU (4 CỘT) */}
        <section className="lg:col-span-4 flex flex-col gap-6">
          
          {/* 1. NOTIFICATION ENGINE FEED (Bộ phát tin nhắn) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between min-h-[300px]">
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="animate-pulse">🔔</span> Notification Feed
                </h3>
                <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded text-[10px] font-mono">
                  LIVE
                </span>
              </div>

              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    className={`p-2.5 rounded-lg border text-xs transition-all ${
                      notif.type === 'certificate' 
                        ? 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 cursor-pointer' 
                        : 'bg-slate-950 border-slate-800'
                    }`}
                    onClick={() => {
                      if (notif.type === 'certificate' && notif.certDetails) {
                        setSelectedCert(notif.certDetails);
                      }
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-base mt-0.5">
                        {notif.type === 'certificate' ? '📜' : notif.type === 'badge' ? '🏆' : '💬'}
                      </span>
                      <div className="flex-1">
                        <p className="text-slate-300">
                          <strong className="text-slate-100">{notif.user}</strong> {notif.message}
                        </p>
                        <div className="flex justify-between items-center mt-1.5">
                          <span className="text-[10px] text-slate-500">{notif.time}</span>
                          {notif.type === 'certificate' && (
                            <span className="text-[9px] text-amber-400 underline font-bold flex items-center gap-0.5">
                              Xem bằng khen ↗
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-500 text-center">
              Tự động cập nhật nhờ Notification Engine đầu ra
            </div>
          </div>

          {/* 2. KHO HUY HIỆU ĐỊNH NGHĨA (ACHIEVEMENT GALLERY) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider mb-4 pb-2 border-b border-slate-800 flex items-center gap-1.5">
              <span>🏆</span> Huy hiệu sẵn có hệ thống
            </h3>

            <div className="space-y-3">
              {Object.values(BADGES_DEFINITION).map((badge) => {
                return (
                  <div key={badge.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-tr ${badge.color} flex items-center justify-center text-xl shadow-md`}>
                      {badge.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-200">{badge.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{badge.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/60 bg-slate-950 py-8 text-center text-xs text-slate-500 mt-12">
        <p>© 2026 Gamification Engine Simulator. All rights reserved.</p>
        <p className="mt-1">Thiết kế bởi Gemini dựa trên Sơ đồ cấu trúc động.</p>
      </footer>

      {/* --- MODAL HIỂN THỊ BẰNG KHEN DANH DỰ (VIRTUAL CERTIFICATE) --- */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-amber-950/40 border-2 border-amber-500/70 p-8 rounded-2xl max-w-lg w-full relative shadow-2xl shadow-amber-500/10 text-center">
            
            {/* Huy hiệu đỉnh vàng */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-gradient-to-tr from-amber-400 to-yellow-600 rounded-full border-4 border-slate-950 flex items-center justify-center text-4xl shadow-xl">
              🎗️
            </div>

            <div className="mt-6 border border-amber-500/30 p-6 rounded-lg bg-slate-950/90 flex flex-col gap-4">
              <span className="text-[10px] uppercase tracking-widest text-amber-500 font-bold font-mono">Hệ thống vinh danh thành viên</span>
              
              <h2 className="text-2xl font-serif text-yellow-300 italic">BẰNG KHEN DANH DỰ</h2>
              
              <div className="h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent my-2"></div>
              
              <p className="text-xs text-slate-400">Trân trọng chứng nhận và vinh danh hội viên cao quý:</p>
              
              <p className="text-xl font-bold text-white tracking-wide">{selectedCert.name}</p>
              
              <p className="text-xs text-slate-400">Đã xuất sắc đạt danh hiệu:</p>
              
              <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg max-w-xs mx-auto">
                <span className="text-sm font-bold text-amber-400 uppercase tracking-wide">🏆 {selectedCert.title}</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed italic px-4">
                "{selectedCert.reason}"
              </p>

              <div className="flex justify-between items-center text-[10px] text-slate-500 mt-6 pt-4 border-t border-slate-900">
                <div>
                  <p>Ngày trao thưởng</p>
                  <p className="font-bold text-slate-400">{selectedCert.date}</p>
                </div>
                <div className="text-right">
                  <p>Hệ thống Gamification</p>
                  <p className="font-bold text-slate-400">ĐÃ XÁC THỰC</p>
                </div>
              </div>
            </div>

            {/* Nút Đóng Modal */}
            <div className="mt-6 flex gap-3 justify-center">
              <button 
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-amber-400 transition-all"
              >
                In bằng khen (PDF)
              </button>
              <button 
                onClick={() => setSelectedCert(null)}
                className="px-4 py-2 bg-slate-900 border border-slate-700 text-slate-300 font-bold rounded-lg text-xs hover:text-white hover:border-slate-600 transition-all"
              >
                Đóng lại
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}