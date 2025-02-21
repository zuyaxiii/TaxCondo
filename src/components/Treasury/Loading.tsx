const Loading = () => (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-gray-600">กำลังโหลดข้อมูล อาจใช้เวลาสักครู่...</p>
      <p className="text-sm text-gray-400">กำลังดึงข้อมูลทั้งหมด</p>
    </div>
  );
  
  export default Loading;
  