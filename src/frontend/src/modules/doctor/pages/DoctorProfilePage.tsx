import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  GraduationCap, 
  FileText, 
  Activity,
  Award,
  MapPin,
  Camera,
  Loader2
} from 'lucide-react';
import { doctorService } from '../../../services/doctorService';
import { avatarService } from '../../../services/avatarService';
import type { Doctor, UpdateDoctorDTO } from '../../../types/doctor';
import { toast } from 'sonner';

const DoctorProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateDoctorDTO>({});
  
  // Avatar uploading state
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await doctorService.getMe();
      setProfile(res);
      setFormData({
        fullName: res.fullName,
        academicTitle: res.academicTitle,
        position: res.position,
        description: res.description,
        yearsOfExperience: res.yearsOfExperience,
        phoneNumber: res.phoneNumber,
        email: res.email
      });
    } catch (error) {
      toast.error("Không thể tải thông tin hồ sơ.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        setSaving(true);
        const res = await doctorService.updateMe(formData);
        toast.success(res.message || "Cập nhật thông tin thành công!");
        setIsEditing(false);
        // Cập nhật lại state local thay vì fetch lại để mượt mà hơn
        if (profile) {
            setProfile({ ...profile, ...res.data });
        }
    } catch (error: any) {
        toast.error(error.message || "Lỗi khi cập nhật thông tin.");
    } finally {
        setSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (e.g. 2MB)
    if (file.size > 2 * 1024 * 1024) {
        return toast.error("Ảnh không được vượt quá 2MB.");
    }

    try {
        setUploadingAvatar(true);
        const res = await avatarService.uploadDoctorAvatar(file);
        toast.success("Cập nhật ảnh đại diện thành công!");
        // Cập nhật URL ảnh mới
        if (profile && res.avatarUrl) {
            setProfile({ ...profile, avatarUrl: res.avatarUrl });
        }
    } catch (error: any) {
        toast.error(error.message || "Lỗi khi tải ảnh lên.");
    } finally {
        setUploadingAvatar(false);
    }
  };

  if (loading) return (
     <div className="flex h-96 items-center justify-center text-slate-400 font-bold animate-pulse text-xs uppercase tracking-widest">
        Đang đồng bộ hồ sơ chuyên môn...
     </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileChange} 
      />

      {/* Header Profile Section */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col md:flex-row items-center gap-6">
         <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
            <div className="h-28 w-28 rounded-lg overflow-hidden border border-slate-200 relative bg-slate-100">
                {uploadingAvatar ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                        <Loader2 className="animate-spin text-indigo-600" size={24} />
                    </div>
                ) : null}
                <img 
                    src={profile?.avatarUrl || `https://ui-avatars.com/api/?name=${profile?.fullName}&size=120&background=4f46e5&color=fff`} 
                    alt="Avatar" 
                    className="h-full w-full object-cover"
                />
            </div>
            <div className="absolute -bottom-2 -right-2 p-1.5 bg-white border border-slate-200 rounded-full text-slate-400 group-hover:text-indigo-600 shadow-sm transition-colors">
                <Camera size={14} />
            </div>
            <div className="absolute inset-x-0 bottom-0 py-1 bg-black/40 text-white text-[8px] font-bold text-center opacity-0 group-hover:opacity-100 transition-opacity rounded-b-lg">
                THAY ĐỔI ẢNH
            </div>
         </div>

         <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-slate-800 uppercase tracking-tight">{profile?.fullName}</h1>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 uppercase tracking-wider w-fit mx-auto md:mx-0">
                    {profile?.academicTitle || 'Bác sĩ'}
                </span>
            </div>
            <p className="text-sm font-semibold text-slate-500 mb-4">{profile?.position || 'Bác sĩ chuyên khoa tại CareFirst'}</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
                 <SmallStat label="Lượt khám" value={profile?.totalAppointments || 0} icon={<Activity size={14} />} />
                 <SmallStat label="Kinh nghiệm" value={`${profile?.yearsOfExperience || 0} Năm`} icon={<Award size={14} />} />
            </div>
         </div>

         {!isEditing && (
             <button 
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded transition-colors"
             >
                SỬA HỒ SƠ
             </button>
         )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Sidebar Contacts */}
         <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Liên hệ công tác</h4>
                <ContactInfo label="Email" value={profile?.email || 'N/A'} icon={<Mail size={14} />} />
                <ContactInfo label="Điện thoại" value={profile?.phoneNumber || 'N/A'} icon={<Phone size={14} />} />
                <ContactInfo label="Vị trí" value="Phòng khám, Tòa nhà B" icon={<MapPin size={14} />} />
            </div>
         </div>

         {/* Detailed Info Form */}
         <div className="lg:col-span-2">
            <form onSubmit={handleUpdate} className="bg-white border border-slate-200 rounded-lg p-8 shadow-sm space-y-6">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-3">
                    <FileText size={16} className="text-indigo-600" /> Thông tin chuyên môn & Tài khoản
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <ProfileInput 
                        label="Họ và Tên" 
                        disabled={!isEditing} 
                        value={formData.fullName} 
                        onChange={v => setFormData({...formData, fullName: v})} 
                        icon={<User size={14} />}
                    />
                    <ProfileInput 
                        label="Học hàm / Học vị" 
                        disabled={!isEditing} 
                        value={formData.academicTitle} 
                        onChange={v => setFormData({...formData, academicTitle: v})} 
                        icon={<GraduationCap size={14} />}
                    />
                    <ProfileInput 
                        label="Vị trí công tác" 
                        disabled={!isEditing} 
                        value={formData.position} 
                        onChange={v => setFormData({...formData, position: v})} 
                        icon={<Briefcase size={14} />}
                    />
                    <ProfileInput 
                        label="Năm kinh nghiệm" 
                        disabled={!isEditing} 
                        type="number"
                        value={String(formData.yearsOfExperience)} 
                        onChange={v => setFormData({...formData, yearsOfExperience: parseInt(v) || 0})} 
                        icon={<Award size={14} />}
                    />
                    <ProfileInput 
                        label="Số điện thoại" 
                        disabled={!isEditing} 
                        value={formData.phoneNumber} 
                        onChange={v => setFormData({...formData, phoneNumber: v})} 
                        icon={<Phone size={14} />}
                    />
                    <ProfileInput 
                        label="Email liên hệ" 
                        disabled={!isEditing} 
                        value={formData.email} 
                        onChange={v => setFormData({...formData, email: v})} 
                        icon={<Mail size={14} />}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Mô tả sự nghiệp & Giới thiệu</label>
                    <textarea 
                        disabled={!isEditing}
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded p-4 text-xs font-medium focus:ring-1 focus:ring-indigo-500 min-h-[120px] outline-none transition-all disabled:opacity-60"
                        placeholder="Giới thiệu về quá trình đào tạo và chuyên môn..."
                    />
                </div>

                {isEditing && (
                    <div className="flex gap-3 pt-4 border-t border-slate-100">
                        <button 
                            type="button" 
                            onClick={() => { setIsEditing(false); fetchProfile(); }}
                            className="px-6 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded transition-colors uppercase"
                        >
                            HỦY BỎ
                        </button>
                        <button 
                            type="submit" 
                            disabled={saving}
                            className="px-10 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded shadow-md shadow-indigo-100 transition-colors disabled:opacity-50 uppercase"
                        >
                            {saving ? 'ĐANG LƯU...' : 'LƯU THÔNG TIN'}
                        </button>
                    </div>
                )}
            </form>
         </div>
      </div>
    </div>
  );
};

const SmallStat = ({ label, value, icon }: any) => (
    <div className="flex items-center gap-2">
        <span className="text-slate-400">{icon}</span>
        <span className="text-[11px] font-bold text-slate-700 uppercase">{value}</span>
        <span className="text-[10px] text-slate-300 font-medium">| {label}</span>
    </div>
);

const ContactInfo = ({ label, value, icon }: any) => (
    <div className="flex items-start gap-3">
        <div className="mt-0.5 text-slate-400">{icon}</div>
        <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{label}</p>
            <p className="text-xs font-semibold text-slate-700">{value}</p>
        </div>
    </div>
);

const ProfileInput = ({ label, value, onChange, disabled, icon, type = "text" }: any) => (
    <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{label}</label>
        <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>
            <input 
                type={type}
                disabled={disabled}
                value={value || ''}
                onChange={e => onChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-10 py-2 text-xs font-medium text-slate-700 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-60 outline-none"
            />
        </div>
    </div>
);

export default DoctorProfilePage;
