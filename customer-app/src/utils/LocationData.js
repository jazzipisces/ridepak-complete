export const locations = {
  punjab: [
    'Lahore', 'Faisalabad', 'Rawalpindi', 'Gujranwala', 'Multan', 
    'Bahawalpur', 'Sargodha', 'Sialkot', 'Sheikhupura', 'Jhang',
    'Rahim Yar Khan', 'Gujrat', 'Kasur', 'Okara', 'Sahiwal',
    'Wah Cantonment', 'Dera Ghazi Khan', 'Kamoke', 'Mandi Bahauddin',
    'Jhelum', 'Sadiqabad', 'Khanewal', 'Hafizabad', 'Kohat',
    'Muzaffargarh', 'Khanpur', 'Gojra', 'Bahawalnagar', 'Muridke',
    'Pak Pattan', 'Abottabad', 'Talagang', 'Toba Tek Singh', 'Kamalia'
  ],
  
  sindh: [
    'Karachi', 'Hyderabad', 'Sukkur', 'Larkana', 'Nawabshah',
    'Mirpurkhas', 'Jacobabad', 'Shikarpur', 'Khairpur', 'Dadu',
    'Ghotki', 'Sanghar', 'Badin', 'Thatta', 'Tando Allahyar',
    'Tando Adam', 'Umerkot', 'Matiari', 'Jamshoro', 'Kotri',
    'Sujawal', 'Tharparkar', 'Naushahro Feroze', 'Shaheed Benazirabad',
    'Kambar Shahdadkot', 'Kashmore', 'Qambar Shahdadkot', 'Tando Muhammad Khan'
  ],
  
  kpk: [
    'Peshawar', 'Mardan', 'Mingora', 'Kohat', 'Dera Ismail Khan',
    'Bannu', 'Swabi', 'Charsadda', 'Nowshera', 'Mansehra',
    'Abbottabad', 'Karak', 'Hangu', 'Haripur', 'Lakki Marwat',
    'Chitral', 'Parachinar', 'Wazirabad', 'Tank', 'Timergara',
    'Alpurai', 'Daggar', 'Batagram', 'Dir', 'Kurram',
    'North Waziristan', 'South Waziristan', 'Mohmand', 'Bajaur', 'Orakzai'
  ],
  
  balochistan: [
    'Quetta', 'Gwadar', 'Turbat', 'Khuzdar', 'Hub', 
    'Chaman', 'Zhob', 'Sibi', 'Loralai', 'Mastung',
    'Kalat', 'Lasbela', 'Nasirabad', 'Jafarabad', 'Dera Bugti',
    'Kohlu', 'Barkhan', 'Musakhel', 'Qilla Saifullah', 'Sherani',
    'Ziarat', 'Awaran', 'Gwadar', 'Kech', 'Panjgur',
    'Washuk', 'Chagai', 'Nushki', 'Kharan', 'Pishin'
  ],
  
  gilgitBaltistan: [
    'Gilgit', 'Skardu', 'Hunza', 'Chilas', 'Ghanche',
    'Diamer', 'Astore', 'Ghizer', 'Nagar', 'Shigar',
    'Khaplu', 'Gultari', 'Kharmang', 'Roundu', 'Gahkuch',
    'Yasin', 'Ishkoman', 'Gojal', 'Chapursan', 'Passu',
    'Karimabad', 'Altit', 'Baltit', 'Khunjerab', 'Hussaini'
  ],
  
  azadKashmir: [
    'Muzaffarabad', 'Mirpur', 'Kotli', 'Bhimber', 'Rawalakot',
    'Bagh', 'Neelum', 'Haveli', 'Sudhanoti', 'Jhelum Valley',
    'Palandri', 'Forward Kahuta', 'Dadyal', 'Samahni', 'Barnala',
    'Charhoi', 'Chinari', 'Hajira', 'Khuiratta', 'Mangla',
    'New Mirpur City', 'Islamgarh', 'Chakswari', 'Tattapani', 'Leepa'
  ],
  
  islamabad: [
    'Blue Area', 'F-6 Markaz', 'F-7 Markaz', 'F-8 Markaz', 'F-9 Markaz',
    'F-10 Markaz', 'F-11 Markaz', 'G-6 Markaz', 'G-7 Markaz', 'G-8 Markaz',
    'G-9 Markaz', 'G-10 Markaz', 'G-11 Markaz', 'Centaurus Mall', 'Emporium Mall',
    'Pakistan Monument', 'Faisal Mosque', 'Daman-e-Koh', 'Lok Virsa', 'Rawal Dam',
    'PWD', 'Saddar', 'Aabpara Market', 'Jinnah Super Market', 'Super Market',
    'PIMS Hospital', 'CDA', 'Parliament House', 'Supreme Court', 'President House'
  ]
};

export const getAllLocations = () => {
  return Object.values(locations).flat();
};

export const getLocationsByProvince = (province) => {
  return locations[province] || [];
};

export const searchLocations = (query) => {
  const allLocations = getAllLocations();
  return allLocations.filter(location => 
    location.toLowerCase().includes(query.toLowerCase())
  );
};