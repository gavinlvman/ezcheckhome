// Google Sheets Configuration
const SHEET_ID = '13gtBfCHzazIH-xfQ8XLtxnBY5GQaRvKE2tj6e0iV4Gg';

// Google Sheets CSV 導出 URL（用於實時數據同步）
// 表格 1：驗樓師簡介 (gid=0)
const INSPECTORS_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;

// 表格 2：買家見證 (gid=422991263) - 已修正！
const TESTIMONIALS_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=422991263`;

// 備用硬編碼數據（當 CSV 加載失敗時使用）
const FALLBACK_INSPECTORS = [
  {
    name: '李明師傅',
    years: 12,
    count: 450,
    qualification: '認證驗樓師',
    imageUrl: 'https://via.placeholder.com/200?text=李明師傅',
    isStar: true,
    rating: 4.9
  },
  {
    name: '王建華',
    years: 8,
    count: 280,
    qualification: '認證驗樓師',
    imageUrl: 'https://via.placeholder.com/200?text=王建華',
    isStar: true,
    rating: 4.8
  },
  {
    name: '陳偉康',
    years: 15,
    count: 520,
    qualification: '認證驗樓師',
    imageUrl: 'https://via.placeholder.com/200?text=陳偉康',
    isStar: true,
    rating: 4.9
  },
  {
    name: '黃俊傑',
    years: 10,
    count: 360,
    qualification: '認證驗樓師',
    imageUrl: 'https://via.placeholder.com/200?text=黃俊傑',
    isStar: false,
    rating: 4.7
  },
  {
    name: '劉思琪',
    years: 7,
    count: 210,
    qualification: '認證驗樓師',
    imageUrl: 'https://via.placeholder.com/200?text=劉思琪',
    isStar: false,
    rating: 4.8
  },
  {
    name: '鄧子軒',
    years: 11,
    count: 390,
    qualification: '認證驗樓師',
    imageUrl: 'https://via.placeholder.com/200?text=鄧子軒',
    isStar: false,
    rating: 4.6
  }
];

const FALLBACK_TESTIMONIALS = [
  {
    name: '陳太太',
    property: '日出康城',
    rating: 5,
    comment: '李師傅非常專業，驗樓過程中發現了多個隱藏問題，讓我們能夠及時跟進。強烈推薦！'
  },
  {
    name: '王先生',
    property: 'YOHO WEST',
    rating: 5,
    comment: '整個配對過程非常快速，王師傅的報告詳細清晰，幫助我們了解新樓的真實狀況。'
  },
  {
    name: '李女士',
    property: '啟德發展區',
    rating: 4,
    comment: '驗樓師非常細心，提供了很多有用的建議。整個服務流程很順暢，值得推薦。'
  },
  {
    name: '黃先生',
    property: '親海駅',
    rating: 5,
    comment: '平台的配對服務很高效，陳師傅的專業知識讓我們對新樓充滿信心。'
  },
  {
    name: '張太太',
    property: '大圍柏傲莊',
    rating: 5,
    comment: '非常感謝驗樓易的推薦，劉師傅的驗樓報告非常詳細，幫助我們做出了正確的決定。'
  },
  {
    name: '周先生',
    property: '九龍灣新盤',
    rating: 4,
    comment: '整個過程很專業，驗樓師發現了幾個需要跟進的問題，非常有幫助。'
  }
];

// 使用 CORS 代理來繞過跨域限制
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';

// Load all data from Google Sheets
async function loadAllDataFromSheets() {
  try {
    console.log('開始從 Google Sheets 加載數據...');
    
    // 嘗試加載驗樓師數據
    await loadInspectors();
    
    // 嘗試加載買家見證數據
    await loadTestimonials();
    
    console.log('數據加載完成');
  } catch (error) {
    console.error('加載數據時出錯:', error);
  }
}

// Load inspectors from Google Sheets CSV
async function loadInspectors() {
  try {
    console.log('正在加載驗樓師數據...');
    
    // 方法 1：嘗試直接加載 CSV（如果 Google Sheets 已設置為公開）
    let inspectors = await loadFromCSV(INSPECTORS_CSV_URL);
    
    if (!inspectors || inspectors.length === 0) {
      console.warn('無法從 CSV 加載驗樓師數據，使用備用數據');
      inspectors = FALLBACK_INSPECTORS;
    } else {
      // 處理從 CSV 加載的數據
      inspectors = inspectors.map(inspector => processInspectorData(inspector));
    }
    
    renderInspectors(inspectors);
  } catch (error) {
    console.warn('加載驗樓師失敗，使用備用數據:', error);
    renderInspectors(FALLBACK_INSPECTORS);
  }
}

// Load testimonials from Google Sheets CSV
async function loadTestimonials() {
  try {
    console.log('正在加載買家見證數據...');
    
    // 方法 1：嘗試直接加載 CSV（如果 Google Sheets 已設置為公開）
    let testimonials = await loadFromCSV(TESTIMONIALS_CSV_URL);
    
    if (!testimonials || testimonials.length === 0) {
      console.warn('無法從 CSV 加載買家見證，使用備用數據');
      testimonials = FALLBACK_TESTIMONIALS;
    } else {
      // 處理從 CSV 加載的數據
      testimonials = testimonials.map(testimonial => processTestimonialData(testimonial));
    }
    
    renderTestimonials(testimonials);
  } catch (error) {
    console.warn('加載買家見證失敗，使用備用數據:', error);
    renderTestimonials(FALLBACK_TESTIMONIALS);
  }
}

// 通用 CSV 加載函數
async function loadFromCSV(csvUrl) {
  try {
    // 嘗試直接加載（如果 CORS 允許）
    const response = await fetch(csvUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();
    return parseCSV(csvText);
  } catch (error) {
    console.warn('直接加載 CSV 失敗，嘗試使用 CORS 代理...', error);
    
    // 備用方案：嘗試使用 CORS 代理
    try {
      const response = await fetch(CORS_PROXY + csvUrl);
      if (!response.ok) {
        throw new Error(`CORS 代理返回錯誤: ${response.status}`);
      }
      const csvText = await response.text();
      return parseCSV(csvText);
    } catch (proxyError) {
      console.warn('CORS 代理也失敗了', proxyError);
      return null;
    }
  }
}

// 解析 CSV 文本為對象數組
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  
  if (lines.length < 2) {
    console.warn('CSV 數據不足');
    return [];
  }
  
  // 找到第一個非空行作為標題
  let headerIndex = 0;
  let headers = [];
  
  for (let i = 0; i < lines.length; i++) {
    const trimmedLine = lines[i].trim();
    if (trimmedLine && trimmedLine.length > 0) {
      headers = lines[i].split(',').map(h => h.trim().toLowerCase());
      headerIndex = i;
      break;
    }
  }
  
  if (headers.length === 0) {
    console.warn('未找到 CSV 標題行');
    return [];
  }
  
  const data = [];
  
  // 從標題行之後開始解析數據
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const trimmedLine = lines[i].trim();
    
    // 跳過空行
    if (!trimmedLine || trimmedLine.length === 0) continue;
    
    const values = lines[i].split(',').map(v => v.trim());
    
    // 跳過沒有任何有效數據的行
    const hasData = values.some(v => v && v.length > 0);
    if (!hasData) continue;
    
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    data.push(row);
  }
  
  return data;
}

// 處理驗樓師數據（混合方法：優先使用 Google Sheets 數據，缺失則使用默認值）
function processInspectorData(csvRow) {
  // 提取年資（移除"年"字）
  const yearsStr = csvRow.years || csvRow['年資'] || '';
  const years = parseInt(yearsStr.replace('年', '')) || 0;
  
  // 提取個案數（移除"+"字）
  const countStr = csvRow.count || csvRow['驗樓個案'] || '';
  const count = parseInt(countStr.replace('+', '')) || 0;
  
  // 提取評分（如果存在）
  let rating = parseFloat(csvRow.rating || csvRow['評分'] || '');
  
  // 混合方法：如果 Google Sheets 中沒有評分，根據 isStar 和年資自動計算
  if (isNaN(rating) || rating === '') {
    const isStar = (csvRow.isstar || csvRow['星級驗樓師'] || '').toLowerCase() === 'true' || 
                   (csvRow.isstar || csvRow['星級驗樓師']) === '是';
    
    // 自動評分邏輯：星級驗樓師基礎 4.8，普通驗樓師基礎 4.5，再根據年資調整
    if (isStar) {
      rating = 4.8 + (Math.min(years, 10) / 50); // 星級驗樓師：4.8-4.98
    } else {
      rating = 4.5 + (Math.min(years, 10) / 50); // 普通驗樓師：4.5-4.68
    }
    rating = Math.min(5, Math.max(1, rating)); // 確保評分在 1-5 之間
  }
  
  return {
    name: csvRow.name || csvRow['驗樓師名字'] || '',
    years: years,
    count: count,
    qualification: csvRow.qualification || csvRow['資格'] || '認證驗樓師',
    imageUrl: csvRow.imageurl || csvRow['圖片url'] || 'https://via.placeholder.com/200?text=' + (csvRow.name || '驗樓師'),
    isStar: (csvRow.isstar || csvRow['星級驗樓師'] || '').toLowerCase() === 'true' || (csvRow.isstar || csvRow['星級驗樓師']) === '是',
    rating: parseFloat(rating.toFixed(1))
  };
}

// 處理買家見證數據
function processTestimonialData(csvRow) {
  return {
    name: csvRow.name || csvRow['買家名字'] || '',
    property: csvRow.property || csvRow['樓盤名稱'] || '',
    rating: parseInt(csvRow.rating || csvRow['評分'] || csvRow.stars || 5),
    comment: csvRow.comment || csvRow['評論'] || csvRow['見證'] || ''
  };
}

// Render inspectors
function renderInspectors(inspectors) {
  const container = document.getElementById('inspectorsGrid');
  if (!container) {
    console.warn('inspectorsGrid 容器未找到');
    return;
  }

  // 清空現有內容
  container.innerHTML = '';

  inspectors.forEach(inspector => {
    const card = document.createElement('div');
    card.className = 'inspector-card';
    
    const starBadge = inspector.isStar ? '<span class="star-badge">⭐ 星級驗樓師</span>' : '';
    
    card.innerHTML = `
      ${starBadge}
      <img src="${inspector.imageUrl}" alt="${inspector.name}" class="inspector-image" onerror="this.src='https://via.placeholder.com/200?text=${encodeURIComponent(inspector.name)}'">
      <h3>${inspector.name}</h3>
      <p class="qualification">${inspector.qualification}</p>
      <div class="stats">
        <div class="stat">
          <span class="label">年資</span>
          <span class="value">${inspector.years}年</span>
        </div>
        <div class="stat">
          <span class="label">驗樓個案</span>
          <span class="value">${inspector.count}+</span>
        </div>
      </div>
      <div class="rating">
        <span class="stars">${'⭐'.repeat(Math.round(inspector.rating))}</span>
        <span class="rating-value">${inspector.rating}</span>
      </div>
      <button class="btn-secondary" onclick="window.location.href='https://wa.me/85265572551?text=我想配對 ${encodeURIComponent(inspector.name)} 驗樓師'">查詢報價</button>
    `;
    
    container.appendChild(card);
  });
  
  console.log(`已渲染 ${inspectors.length} 位驗樓師`);
}

// Render testimonials with carousel
function renderTestimonials(testimonials) {
  const container = document.getElementById('carouselTrack');
  if (!container) {
    console.warn('carouselTrack 容器未找到');
    return;
  }

  // 清空現有內容
  container.innerHTML = '';

  testimonials.forEach((testimonial, index) => {
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';
    
    const stars = '⭐'.repeat(Math.max(1, Math.min(5, testimonial.rating)));
    
    slide.innerHTML = `
      <div class="testimonial-card">
        <div class="testimonial-header">
          <h4>${testimonial.name}</h4>
          <span class="property">${testimonial.property}</span>
        </div>
        <div class="testimonial-rating">${stars}</div>
        <p class="testimonial-text">"${testimonial.comment}"</p>
      </div>
    `;
    
    container.appendChild(slide);
  });

  // 初始化輪播控制
  initializeCarousel();
  
  console.log(`已渲染 ${testimonials.length} 條買家見證`);
}

// Initialize carousel functionality
function initializeCarousel() {
  const track = document.getElementById('carouselTrack');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  
  if (!track || !prevBtn || !nextBtn) {
    console.warn('輪播元素未找到');
    return;
  }

  let currentIndex = 0;
  const slides = track.querySelectorAll('.carousel-slide');
  const totalSlides = slides.length;

  if (totalSlides === 0) {
    console.warn('沒有找到輪播幻燈片');
    return;
  }

  function updateCarousel() {
    const offset = -currentIndex * 100;
    track.style.transform = `translateX(${offset}%)`;
  }

  prevBtn.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
    updateCarousel();
  });

  nextBtn.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % totalSlides;
    updateCarousel();
  });

  // 自動輪播（每 5 秒）
  setInterval(() => {
    currentIndex = (currentIndex + 1) % totalSlides;
    updateCarousel();
  }, 5000);

  // 初始化輪播位置
  updateCarousel();
}

// 定期刷新數據（每 30 秒）
function setupAutoRefresh() {
  setInterval(() => {
    console.log('自動刷新數據...');
    loadAllDataFromSheets();
  }, 30000); // 30 秒
}

// 初始化當頁面加載時
document.addEventListener('DOMContentLoaded', () => {
  console.log('頁面已加載，開始加載 Google Sheets 數據...');
  loadAllDataFromSheets();
  setupAutoRefresh();
});

// 也在窗口加載時嘗試加載
window.addEventListener('load', () => {
  const inspectorsGrid = document.getElementById('inspectorsGrid');
  const carouselTrack = document.getElementById('carouselTrack');
  
  // 如果容器為空，嘗試重新加載
  if (inspectorsGrid && inspectorsGrid.children.length === 0) {
    console.log('驗樓師容器為空，重新加載...');
    loadInspectors();
  }
  
  if (carouselTrack && carouselTrack.children.length === 0) {
    console.log('見證容器為空，重新加載...');
    loadTestimonials();
  }
});
