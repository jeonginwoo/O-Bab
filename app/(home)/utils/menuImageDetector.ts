/**
 * 메뉴판 이미지 자동 감지 유틸리티
 * 
 * 이미지 메타데이터를 분석하여 메뉴판과 음식 이미지를 자동으로 구분합니다.
 * 
 * 판단 기준:
 * - PNG 파일 형식 (+40점)
 * - 밝은 색상 (회색/흰색 배경) (+15~30점)
 * - 독특한 해상도 (다른 이미지들과 다름) (+20점)
 * - 총 60점 이상이면 메뉴판으로 인식
 */

export interface MediaImage {
  type: string;
  url: string;
  mimetype?: string;      // 이미지 MIME 타입 (예: image/png, image/jpeg)
  avg?: string;           // 평균 색상 (예: #e5e6e7)
  width?: number;         // 이미지 너비
  height?: number;        // 이미지 높이
  filename?: string;      // 파일명
}

interface ScoredImage {
  image: MediaImage;
  score: number;
  index: number;
}

/**
 * 이미지가 메뉴판일 가능성을 점수로 계산 (0~100)
 * 높을수록 메뉴판일 가능성 높음
 */
export function calculateMenuScore(media: MediaImage): number {
  let score = 0;

  // 1. PNG 파일은 메뉴판일 가능성 높음 (+40점)
  if (media.mimetype === 'image/png') {
    score += 40;
  }

  // 2. 평균 색상이 밝은 회색/흰색 계열이면 메뉴판일 가능성 높음 (+30점)
  if (media.avg) {
    const hex = media.avg.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r + g + b) / 3;
    
    // 평균 밝기가 200 이상이면 밝은 이미지
    if (brightness >= 200) {
      score += 30;
    } else if (brightness >= 180) {
      score += 15;
    }
  }

  return score;
}

/**
 * 이미지 배열에서 메뉴판 이미지를 자동으로 감지
 * 
 * @param images - 감지할 이미지 배열
 * @param options - 옵션
 * @param options.threshold - 메뉴판 인식 최소 점수 (기본값: 60)
 * @param options.maxMenuCount - 최대 메뉴판 이미지 개수 (기본값: 2)
 * @returns { menuImages, foodImages } 또는 null (감지 실패)
 */
export function detectMenuImages(
  images: MediaImage[], 
  options: { threshold?: number; maxMenuCount?: number } = {}
): { menuImages: MediaImage[], foodImages: MediaImage[] } | null {
  const { threshold = 60, maxMenuCount = 2 } = options;

  if (images.length === 0) return null;

  // 각 이미지의 메뉴 점수 계산
  const scored: ScoredImage[] = images.map((img, idx) => ({
    image: img,
    score: calculateMenuScore(img),
    index: idx
  }));

  // 해상도가 다른 이미지에 가산점 부여
  const resolutions = scored.map(s => `${s.image.width}x${s.image.height}`);
  const resolutionCounts = resolutions.reduce((acc, res) => {
    acc[res] = (acc[res] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  scored.forEach(item => {
    const res = `${item.image.width}x${item.image.height}`;
    // 해상도가 유니크하거나 소수면 메뉴판일 가능성 (+20점)
    if (resolutionCounts[res] === 1 || resolutionCounts[res] <= images.length / 3) {
      item.score += 20;
    }
  });

  // 점수 순으로 정렬
  scored.sort((a, b) => b.score - a.score);

  // threshold 이상인 이미지만 메뉴판 후보로 선정
  const menuCandidates = scored.filter(s => s.score >= threshold);

  if (menuCandidates.length === 0) {
    return null; // 감지 실패
  }

  // 메뉴판 개수 제한
  const menuCount = Math.min(menuCandidates.length, maxMenuCount);
  const menuIndices = new Set(menuCandidates.slice(0, menuCount).map(s => s.index));

  const menuImages = images.filter((_, idx) => menuIndices.has(idx));
  const foodImages = images.filter((_, idx) => !menuIndices.has(idx));

  return { menuImages, foodImages };
}

/**
 * 디버깅용: 각 이미지의 점수를 계산하여 반환
 */
export function debugMenuScores(images: MediaImage[]): Array<{ url: string; score: number; details: string }> {
  return images.map((img) => {
    const score = calculateMenuScore(img);
    const details: string[] = [];
    
    if (img.mimetype === 'image/png') details.push('PNG(+40)');
    if (img.avg) {
      const hex = img.avg.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      const brightness = (r + g + b) / 3;
      if (brightness >= 200) details.push('밝음(+30)');
      else if (brightness >= 180) details.push('약간밝음(+15)');
    }
    
    return {
      url: img.url,
      score,
      details: details.join(', ')
    };
  });
}
