"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Chip, Menu, MenuItem, IconButton, Tooltip, Paper, Divider, Modal } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import CloseIcon from '@mui/icons-material/Close';
import { useNaverMap } from '../../hooks/useNaverMap';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Keyboard } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface Restaurant {
  id: number;
  name: string;
  address: string;
  menu: string;
  images?: string[];
}

interface RestaurantMarker {
  restaurantId: number;
  marker: naver.maps.Marker;
  infoWindow: naver.maps.InfoWindow;
  originalPosition: naver.maps.LatLng;
}

const sampleRestaurants: Restaurant[] = [
  { id: 1, name: '고기부자집', address: '서울 금천구 가산디지털1로 168 A동 B119호', menu: '육류,고기요리', images: ['https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250513_248%2F1747126235376gl8pE_JPEG%2F1000008788.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250513_140%2F17471264111626Jp3Q_JPEG%2F1000008705.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250513_159%2F1747126411184aIONV_JPEG%2F1000007503.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250513_170%2F1747126262645hkBzN_JPEG%2F1000008781.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250513_254%2F1747126411154rWm3B_JPEG%2F1000007505.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250513_207%2F1747126411227mt3hP_JPEG%2F1000008704.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250513_82%2F1747126410983vv33F_JPEG%2F1000008732.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250513_227%2F1747126411224hIW0q_JPEG%2F1000008730.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250513_168%2F1747126411308tpQxq_JPEG%2F1000007492.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250513_168%2F1747126411308tpQxq_JPEG%2F1000007492.jpg'] },
  { id: 2, name: '양원집 가산디지털단지점', address: '서울 금천구 가산디지털1로 168 우림라이온스밸리 A동 207호', menu: '양갈비', images: ['https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20241107_208%2F1730959114139XwD2B_JPEG%2F1000007951.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20241024_192%2F1729748659209pAnH4_JPEG%2F1000007595.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20241024_272%2F1729748659233rk0gI_JPEG%2F1000007596.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20240306_239%2F17097047773245nPyI_JPEG%2F%25BE%25E7%25B0%25A5%25BA%25F13.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20240306_69%2F1709704820357pOeLm_JPEG%2F%25BE%25E7%25B0%25A5%25BA%25F11.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20240306_175%2F1709704806139vq92u_JPEG%2F%25B0%25ED%25B1%25E2%25B8%25F0%25C0%25BD2.jpg'] },
  { id: 3, name: '서울식당', address: '서울 금천구 가산디지털1로 168 우림라이온스밸리1차 A동 2층', menu: '한식', images: ['https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20240706_273%2F1720232665473KiNiB_JPEG%2F20210524_131720.jpg', 'https://search.pstatic.net/common/?src=http%3A%2F%2Fimage.nmv.naver.net%2Fblog_2025_06_07_1844%2FxJDCTeFtyb_03.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fpup-review-phinf.pstatic.net%2FMjAyNTA4MDFfNTcg%2FMDAxNzU0MDIwMTI5NDMw.S_UQ6UT5OwWCQNUCR0hE_0IsGkYYT0ZGB_I5mYZpyVog.JBfiDMYYbNxDiSI--lqlFAakSyA9Jx66NLhK6ehjsJog.JPEG%2F48D3877D-7998-4BDD-A685-F1B7A28434FB.jpeg%3Ftype%3Dw1500_60_sharpen'] },
  { id: 4, name: '양은이네 가산직영점', address: '서울 금천구 가산디지털1로 168 우림라이온스밸리 A동 2층 205호', menu: '한식', images: ['https://search.pstatic.net/common/?src=https%3A%2F%2Fnaverbooking-phinf.pstatic.net%2F20250627_94%2F1750988094682xy2fe_JPEG%2FKakaoTalk_20250626_154942271.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fnaverbooking-phinf.pstatic.net%2F20250627_48%2F1750988095684Fv7HN_JPEG%2FKakaoTalk_20250626_154942271_01.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fnaverbooking-phinf.pstatic.net%2F20250627_20%2F1750988096006g1PcE_JPEG%2FKakaoTalk_20250626_154942271_02.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fnaverbooking-phinf.pstatic.net%2F20250627_80%2F1750988096355zQpHU_JPEG%2FKakaoTalk_20250626_154942271_03.jpg'] },
  { id: 5, name: '가산 마포갈매기', address: '서울 금천구 벚꽃로 298 대륭포스트타워 6차 B1층(지하) 104호', menu: '육류,고기요리', images: ['https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250818_51%2F1755513946926i9kxk_JPEG%2FKakaoTalk_20250817_174849046_19.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250829_246%2F1756447105469tJIOd_JPEG%2FKakaoTalk_20250817_174849046.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250818_205%2F1755513935790xCGMw_JPEG%2FKakaoTalk_20250817_174849046_08_%25282%2529.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20251025_19%2F1761385550109wLnyI_GIF%2F%25C1%25A6%25B8%25F1_%25BE%25F8%25B4%25C2_%25B5%25F0%25C0%25DA%25C0%25CE_%25285%2529.gif', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250818_3%2F1755513887862HYnSz_JPEG%2FKakaoTalk_20250817_174849046_21.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250903_73%2F1756875619664zUqEi_PNG%2F%25C1%25A6%25B8%25F1%25C0%25BB_%25C0%25D4%25B7%25C2%25C7%25D8%25C1%25D6%25BC%25BC%25BF%25E4._%25287%2529.png', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20251216_254%2F1765858227107Mz181_JPEG%2FKakaoTalk_20251216_130048502_05.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250809_170%2F1754728442761XEwMn_JPEG%2FKakaoTalk_20250809_171155470.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250809_213%2F1754728442887lvzoT_JPEG%2FKakaoTalk_20250809_171155470_03.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250809_271%2F1754728442871VqF97_JPEG%2FKakaoTalk_20250809_171155470_06.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20190129_202%2F1548722673895MnJ3I_JPEG%2FAYZRxuRXcRg5EXvrv2cTX4lR.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20190826_92%2F156682731457214xb8_JPEG%2FfW-AqsOqUB17GBNzbJefq9j-.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20200217_240%2F1581938285213Dr2iC_JPEG%2FkKj10GWdb32iLzUsGCpQHdPA.jpeg.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20200217_191%2F1581938297864B1aNP_JPEG%2FwBec2dTroTiq57t_Dz76-oV0.jpeg.jpg'] },
  { id: 6, name: '여장군 가산점', address: '서울 금천구 가산디지털1로 142 더스카이밸리 2층 220호', menu: '육류,고기요리', images: ['https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250709_164%2F1752030275941vPXgh_JPEG%2F%25BD%25E6%25B3%25D7%25C0%25CF.JPG', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250709_219%2F175203027598018XwM_JPEG%2F%25BB%25F3%25BC%25BC%25C0%25CC%25B9%25CC%25C1%25F6_1.JPG', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250709_242%2F1752030275980xpfhV_JPEG%2F%25BB%25F3%25BC%25BC%25C0%25CC%25B9%25CC%25C1%25F6_2.JPG', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250709_211%2F1752030289650mDQNx_JPEG%2FKakaoTalk_20250709_103453677_05.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250730_293%2F1753863745979OzDt3_JPEG%2Ftemp_picture.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250715_269%2F1752543466810lxMRU_JPEG%2FKakaoTalk_20250709_135208369_01.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250715_272%2F1752543466817Rse97_JPEG%2FKakaoTalk_20250709_135147559.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250715_69%2F1752543466742KQWhz_JPEG%2FKakaoTalk_20250709_135155280.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250715_146%2F1752543466806oatM3_JPEG%2FKakaoTalk_20250709_135147559_01.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250715_75%2F17525434667276Nagn_JPEG%2FKakaoTalk_20250709_135147559_02.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250715_103%2F1752543466746SdeYE_JPEG%2FKakaoTalk_20250709_135155280_01.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250715_224%2F1752543466789pIcUo_JPEG%2FKakaoTalk_20250709_135155280_02.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250715_40%2F1752543466793JCKJn_JPEG%2FKakaoTalk_20250709_135147559_03.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250709_219%2F1752030333100ucBJK_JPEG%2FKakaoTalk_20250709_103005217.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250709_235%2F1752030333048EME3q_JPEG%2FKakaoTalk_20250709_103005217_01.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250709_32%2F1752030333098e04b7_JPEG%2FKakaoTalk_20250709_103005217_02.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250709_190%2F1752030333076M4dpG_JPEG%2FKakaoTalk_20250709_103005217_03.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250801_66%2F17540489749935Dc2y_JPEG%2Ftemp_picture.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250801_42%2F1754049070141Kgcis_JPEG%2Ftemp_picture.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250804_287%2F1754282833514gEdnt_JPEG%2F1000007415.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fnaverbooking-phinf.pstatic.net%2F20251024_128%2F17613005957886GzPS_JPEG%2Fimage.jpg'] },
  { id: 7, name: '오리오리 가산디지털단지점', address: '서울 금천구 가산디지털1로 186 제이플라츠 지하1층 B130호', menu: '오리요리', images: ['https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20230328_76%2F1680003462025meAsU_JPEG%2F20230325_095400.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fnaverbooking-phinf.pstatic.net%2F20230419_240%2F1681889461278BGrUt_JPEG%2F_MG_9683.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fnaverbooking-phinf.pstatic.net%2F20230419_269%2F1681889463470kxY7z_JPEG%2F_MG_9707.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fnaverbooking-phinf.pstatic.net%2F20230419_41%2F1681889463816HN4Hx_JPEG%2F_MG_9703-2.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fnaverbooking-phinf.pstatic.net%2F20230419_121%2F1681889460782MXzXM_JPEG%2F02.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fnaverbooking-phinf.pstatic.net%2F20230419_260%2F168188946276741Kwv_JPEG%2F%25B5%25B5%25B8%25AE0%25A3%25B0.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fnaverbooking-phinf.pstatic.net%2F20230419_77%2F1681889463040BeHYj_JPEG%2F%25B5%25B5%25B8%25AE0%25A3%25B2.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20230328_178%2F1680003566004GtJ9z_JPEG%2F20230325_095127.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20230328_279%2F16800035492688Gnyf_JPEG%2F20230325_095201.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20230328_173%2F1680003525139Pd4OW_JPEG%2F20230325_095222.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20230320_222%2F1679319930779AbOnj_JPEG%2F%25BF%25C0%25B8%25AE%25BF%25C0%25B8%25AE%25BA%25EA%25B7%25A3%25B5%25E5.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fnaverbooking-phinf.pstatic.net%2F20230419_289%2F1681889459291jsIgA_JPEG%2F04.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fnaverbooking-phinf.pstatic.net%2F20230419_131%2F1681889460555byDHc_JPEG%2F01.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fnaverbooking-phinf.pstatic.net%2F20230419_297%2F1681889461008rHPe1_JPEG%2F03.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fnaverbooking-phinf.pstatic.net%2F20230419_40%2F1681889461692nI82B_JPEG%2F20230406_173109.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fnaverbooking-phinf.pstatic.net%2F20230419_76%2F1681889462050mMJSF_JPEG%2F20230406_173711.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fnaverbooking-phinf.pstatic.net%2F20230419_281%2F1681889462338iC9E6_JPEG%2F%25B5%25B5%25B8%25AE01.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fnaverbooking-phinf.pstatic.net%2F20230419_271%2F1681889464214Xbf12_JPEG%2F5.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fnaverbooking-phinf.pstatic.net%2F20230419_86%2F1681889464589JNTph_JPEG%2F%25C0%25FC%25B0%25F1%25A3%25B0%25A3%25B2.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20230328_150%2F1680003590439H0r9J_JPEG%2F20230325_094904.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20230328_298%2F1680003579503grkHt_JPEG%2F20230325_094910.jpg'] },
  { id: 8, name: '민락양꼬치👍', address: '경기 의정부시 오목로225번길 16-4 1층', menu: '양꼬치', images: ['https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20231120_13%2F1700481119242rwGwq_JPEG%2FResized_20231119_124148.jpeg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20231120_84%2F17004811191959t4pp_JPEG%2FResized_20231120_204808.jpeg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20231120_87%2F1700481119211CFSAI_JPEG%2FResized_20231120_204753.jpeg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20231120_246%2F1700481119213WclGy_JPEG%2FResized_20231120_204813.jpeg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fpup-review-phinf.pstatic.net%2FMjAyNTA3MDVfMjA4%2FMDAxNzUxNzA2OTQxNDIx.3LFWPbZNVADrFJUs4pSdQ4fcEjryg8OfVri61klBERog.AlNUp7YzpBH6K2_mHykuaBRttQ5UDcakt347e3p_Yokg.JPEG%2F0F381E1B-B805-4FB2-84A6-04A00CE361ED.jpeg%3Ftype%3Dw1500_60_sharpen', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fblogfiles.pstatic.net%2FMjAyNTA1MTlfMjA1%2FMDAxNzQ3NjE3MzMyOTMz.j7IO1IfWZ_jAT2S023zVNVgh5usrqwnMe65PlsiTVsgg.QBH6WB4yU0VrZ3O6kLtoW5EiwgJbFD4WBumhyjeQ_CQg.JPEG%2FIMG%EF%BC%BF8648.jpg%2F900x1200'] },
  { id: 9, name: '더낙원램양꼬치', address: '서울 관악구 남부순환로151길 78 1층', menu: '양꼬치', images: ['https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250627_91%2F1751016011945yr1lo_JPEG%2F%25BE%25E7%25B2%25BF%25C4%25A1%25BB%25E7%25C1%25F8.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250627_10%2F1751016260736NOr9a_JPEG%2F%25B4%25DC%25C3%25C3%25B9%25C7%25BD%25C4.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250627_97%2F1751016195019b5Lyp_JPEG%2F%25B2%25E3%25B9%25D9%25B7%25CE%25BF%25EC.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250314_239%2F1741936714828Kv5NP_JPEG%2F17419367001102535278338032251680.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250314_121%2F1741936882469rd3In_JPEG%2F17419368715674976179368462924515.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250314_144%2F17419368693248kl1A_JPEG%2F17419368515542368802005909898730.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250314_268%2F1741936849215j2poK_JPEG%2F1741936819327887879420166580985.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250314_117%2F1741936816438yvS9k_JPEG%2F17419367890378265415588167049874.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250314_2%2F1741936775499YtHfw_JPEG%2F17419367266102638373643806245195.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20240718_50%2F1721314628937e6zei_PNG%2F%25B4%25F5%2528The%2529%25B3%25AB%25BF%25F8%25BE%25E7%25B2%25BF%25C4%25A1-5.png', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20240718_254%2F1721314629050tbXGV_PNG%2F%25B4%25F5%2528The%2529%25B3%25AB%25BF%25F8%25BE%25E7%25B2%25BF%25C4%25A1-4.png', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20240718_274%2F1721314628787YHfg7_PNG%2F%25B4%25F5%2528The%2529%25B3%25AB%25BF%25F8%25BE%25E7%25B2%25BF%25C4%25A1-1.png', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20240518_261%2F1716033883390gDPpS_JPEG%2F20240213_180353.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20240518_108%2F1716033883337ins5V_JPEG%2F20240213_180404.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20240518_299%2F1716033883205gmgyy_JPEG%2F20240213_180413.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20240518_236%2F1716033850898RqXGb_JPEG%2F20230805_200527.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20240518_12%2F1716033851016dCy2C_JPEG%2F20230729_002822.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20240518_183%2F1716033850965PSfiQ_JPEG%2F20230728_202316.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20240518_265%2F1716033759696y407h_JPEG%2F20240203_192323.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20240518_220%2F1716033759604IArTa_JPEG%2F20240202_214112.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20240518_299%2F1716033759779BaJA1_JPEG%2F20240202_205020.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20240518_157%2F1716033759658V7aLl_JPEG%2F20240202_205926.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20240518_73%2F1716033759627K9q0W_JPEG%2F20240202_193309.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20240518_153%2F1716033759708ap9UP_JPEG%2F20240202_203814.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20240518_132%2F1716033759630Vhkxn_JPEG%2F20240202_190250.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20240518_187%2F1716033759655zH2w6_JPEG%2F20240123_190712.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20240518_286%2F17160337596416mK0e_JPEG%2F20240125_195101.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20240518_214%2F1716033759585WTh4j_JPEG%2F20240202_184636.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20240518_152%2F1716033759767gB6fV_JPEG%2F20240202_185730.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20230801_153%2F1690884482467CCq8m_PNG%2FKakaoTalk_20230801_125319288_01.png', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20230726_91%2F16903635655056eAJV_JPEG%2FKakaoTalk_20230726_173638898.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20230801_160%2F1690864014641PDBp0_JPEG%2FKakaoTalk_20230728_133110572.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20230801_120%2F16908640147325FMLJ_JPEG%2FKakaoTalk_20230728_133110826.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20230801_75%2F16908640139395IANj_JPEG%2FKakaoTalk_20230728_133109256.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20230726_49%2F1690363565434Por9a_JPEG%2FKakaoTalk_20230726_173638688.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20230801_37%2F1690864013977urT5W_JPEG%2FKakaoTalk_20230728_133108035.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20230701_131%2F1688152172332TTzev_JPEG%2F16881521511986354396403983914983.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20230801_175%2F16908640149728EXgE_JPEG%2FKakaoTalk_20230728_133111605.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20230726_170%2F1690363565421gUpEd_JPEG%2FKakaoTalk_20230726_173639110.jpg'] },
  { id: 10, name: '먹거리곱창', address: '서울 성북구 정릉로21길 71 1층', menu: '곱창,막창,양', images: ['https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20220924_298%2F1663950739337hAtTj_JPEG%2Ftemp_1613548023080.1913442827.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20220924_259%2F1663950739332KTkUI_JPEG%2Ftemp_1613548189050.129208786.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20220924_300%2F1663950739647ITOWc_JPEG%2F1634978509267.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20211023_5%2F1634978760890PTTtN_JPEG%2FTSW9tffFsfH9sXhf8GgOTZsQ.jpg'] },
  { id: 11, name: '천막집', address: '서울 성북구 보문로30길 31 1층 천막집', menu: '요리주점', images: ['https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20251227_106%2F1766811501192gMHKc_PNG%2FIMG_2912.png', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20251227_208%2F1766811501175ffjlb_PNG%2FIMG_2911.png', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20251227_215%2F1766811501175lGUUA_PNG%2FIMG_2910.png', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20251201_292%2F1764592089272gF9Er_JPEG%2FIMG_1951.jpeg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20260208_284%2F17705384580249Vlc6_JPEG%2FIMG_3324.jpeg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20260208_154%2F1770538449263yewu5_JPEG%2FIMG_3319.jpeg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250219_223%2F1739893568271u4Aqd_JPEG%2FIMG_9559.jpeg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250219_248%2F1739893555322f9HXB_JPEG%2FIMG_6916.jpeg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250106_96%2F1736154628354Kaewi_JPEG%2FIMG_9133.jpeg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20230808_254%2F1691443245963GUd3v_JPEG%2F1685007486306.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20210306_238%2F1615041968143lblLS_JPEG%2Fc-6SEPQI9tZ9kXLmm-4tzpW8.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20210306_13%2F1615041968760Hc21w_JPEG%2FQc36Qm7DgKpUuhG9NJ_UYH9e.jpg', 'https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20210306_142%2F1615042281096BJmWI_JPEG%2FqxnjPgfcc0Ex3haa_gaHebmU.jpg'] },
];

const RestaurantChip = ({ 
  restaurant, 
  isSelected, 
  onClick 
}: { 
  restaurant: Restaurant; 
  isSelected: boolean; 
  onClick: () => void; 
}) => (
  <Chip
    label={
      <span>
        {restaurant.name}{" "}
        <span style={{ fontSize: "0.85em", opacity: 0.6 }}>
          ({restaurant.menu})
        </span>
      </span>
    }
    onClick={onClick}
    color={isSelected ? "secondary" : "default"}
    variant={isSelected ? "filled" : "outlined"}
    clickable
  />
);

const RestaurantMap = () => {
  const { isLoaded, error } = useNaverMap();
  const mapRef = useRef<HTMLDivElement | null>(null);
  const chipsContainerRef = useRef<HTMLDivElement>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [isUserMenuMode, setIsUserMenuMode] = useState(false); // User preference
  const [mobileAnchorEl, setMobileAnchorEl] = useState<null | HTMLElement>(null);
  
  // Changed type to HTMLElement to support Chip
  const isMobileMenuOpen = Boolean(mobileAnchorEl);
  const [map, setMap] = useState<naver.maps.Map | null>(null);
  const markersRef = useRef<RestaurantMarker[]>([]);
  const initialMapCenterRef = useRef<naver.maps.LatLng | null>(null);

  // Image slider modal state
  const [openImageModal, setOpenImageModal] = useState(false);
  const [imageModalSlide, setImageModalSlide] = useState(0);

  const handleImageClick = (idx: number) => {
    setImageModalSlide(idx);
    setOpenImageModal(true);
  };

  const handleCloseImageModal = () => {
    setOpenImageModal(false);
  };

  const toggleViewMode = () => {
    setIsUserMenuMode((prev) => !prev);
  }

  useEffect(() => {
    // Initial auto-detection: if content is large, switch to menu mode by default.
    // We use a one-time observer to detect initial overflow.
    const observer = new ResizeObserver(() => {
        if (chipsContainerRef.current) {
             const height = chipsContainerRef.current.offsetHeight;
             // If height > 110 (approx 2 lines), auto-enable menu mode initially
             if (height > 110) {
                 setIsUserMenuMode(true);
                 observer.disconnect(); // Only auto-switch once on load
             }
        }
    });

    if (chipsContainerRef.current) {
      observer.observe(chipsContainerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  // Initialize map and markers
  useEffect(() => {
    if (!isLoaded || !mapRef.current || map) {
      return;
    }

    // Define initial map center
    initialMapCenterRef.current = new window.naver.maps.LatLng(37.477956675, 126.881596144);

    // 1. Create Map instance
    const mapInstance = new window.naver.maps.Map(mapRef.current, {
      center: initialMapCenterRef.current,
      zoom: 17,
    });
    setMap(mapInstance);

    // Add '프로텐' marker at the center
    new window.naver.maps.Marker({
      position: mapInstance.getCenter(),
      map: mapInstance,
      title: '프로텐',
      icon: {
        url: '/proten.png',
        size: new window.naver.maps.Size(50, 50),      // 1. 마커가 보여질 영역의 크기
        scaledSize: new window.naver.maps.Size(50, 50), // 2. 실제 이미지의 크기 (이게 있어야 리사이징 됨)
        origin: new window.naver.maps.Point(0, 0),
        anchor: new window.naver.maps.Point(25, 50)     // 3. 이미지의 하단 중앙이 좌표에 오도록 설정 (가로/2, 세로)
      },
    });

    // 2. Geocode and create markers
    sampleRestaurants.forEach((restaurant) => {
      if (!window.naver.maps.Service) {
        console.error("Naver Maps Service is not available.");
        return;
      }
      naver.maps.Service.geocode({ query: restaurant.address }, (status, response) => {
        if (status !== naver.maps.Service.Status.OK || !response.v2.addresses.length) {
          console.error('Geocoding error for:', restaurant.address);
          return;
        }

        const coords = response.v2.addresses[0];
        const point = new naver.maps.LatLng(parseFloat(coords.y), parseFloat(coords.x));

        let finalPosition = point;
        const sameLocMarkers = markersRef.current.filter(m => 
            m.originalPosition.equals(point)
        );

        if (sameLocMarkers.length > 0) {
            const spacing = 0.0002;
            const offsetIdx = sameLocMarkers.length;
            const theta = offsetIdx * 2.4; // Approx 137.5 degrees
            const r = spacing * (1 + 0.1 * offsetIdx); 
            
            const lat = parseFloat(coords.y) + r * Math.sin(theta);
            const lng = parseFloat(coords.x) + r * Math.cos(theta);
            finalPosition = new naver.maps.LatLng(lat, lng);
        }

        const marker = new naver.maps.Marker({ position: finalPosition, map: mapInstance, title: restaurant.name });
        const naverMapSearchUrl = `https://map.naver.com/v5/search/${encodeURIComponent(restaurant.address)}`;

        const contentEl = document.createElement("div");
        contentEl.style.cssText = "padding: 10px; min-width: 200px; max-width: calc(100vw - 40px); width: 260px; line-height: 1.5; color: #000; position: relative; word-break: break-word; box-sizing: border-box;";

        contentEl.innerHTML = `
          <h4 style="margin: 0 0 5px 0; padding-right: 20px;">
            <a href="${naverMapSearchUrl}" target="_blank" rel="noopener noreferrer" style="color: #03a9f4; text-decoration: underline;">${restaurant.name}</a>
          </h4>
          <p style="margin: 0; color: #333;">${restaurant.address}</p>
          <p style="margin: 0; color: #977162;">${restaurant.menu}</p>
        `;

        const closeBtn = document.createElement("button");
        closeBtn.innerHTML = "&#x2715;";
        closeBtn.style.cssText = "position: absolute; top: 0px; right: 0px; border: none; background: transparent; cursor: pointer; font-size: 18px; color: #888; padding: 5px; line-height: 1;";
        closeBtn.type = "button";
        contentEl.appendChild(closeBtn);

        const infoWindow = new naver.maps.InfoWindow({
          content: contentEl,
          maxWidth: 300,
          borderWidth: 0,
        });

        closeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          infoWindow.close();
        });

        markersRef.current.push({ restaurantId: restaurant.id, marker, infoWindow, originalPosition: point });

        naver.maps.Event.addListener(marker, 'click', () => {
          markersRef.current.forEach(m => m.infoWindow.close());
          infoWindow.open(mapInstance, marker);
          setSelectedRestaurant(restaurant);
          mapInstance.panTo(finalPosition);
        });
      });
    });
  }, [isLoaded, map]);
  
  const handleListItemClick = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    if (!map) return;
    const restaurantMarker = markersRef.current.find(m => m.restaurantId === restaurant.id);
    if (restaurantMarker) {
      map.panTo(restaurantMarker.marker.getPosition());
      markersRef.current.forEach(m => m.infoWindow.close());
      restaurantMarker.infoWindow.open(map, restaurantMarker.marker);
    }
  };

  const handleCenterMap = () => {
    setSelectedRestaurant(null);
    if (map && initialMapCenterRef.current) {
      map.setCenter(initialMapCenterRef.current);
      map.setZoom(17);
    }
  };

  const handleMobileMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setMobileAnchorEl(event.currentTarget);
  };
  
  const handleMobileMenuClose = () => {
    setMobileAnchorEl(null);
  };

  const handleMobileSelect = (r: Restaurant) => {
    handleListItemClick(r);
    handleMobileMenuClose();
  };

  if (error) return <Alert severity="error">지도를 불러오는데 실패했습니다: {error.message}</Alert>;
  if (!isLoaded) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /><Typography sx={{ ml: 2 }}>지도 로딩 중...</Typography></Box>;

  const naverMapSearchUrl = selectedRestaurant
    ? `https://map.naver.com/v5/search/${encodeURIComponent(selectedRestaurant.address)}`
    : '';
  
  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
       {/* Removed separate toggle button bar */}
      <Box sx={{ position: 'relative', width: '100%', flexShrink: 0 }}>
        {/* Chips Container - Rendered when NOT in menu mode */}
        {!isUserMenuMode && (
        <div 
          ref={chipsContainerRef}
          style={{ 
            padding: '16px', 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '8px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <Chip
            label="프로텐"
            onClick={handleCenterMap}
            clickable
            color="primary"
            variant="filled"
          />
          <Tooltip title="간략히 보기">
            <Chip
               label={<ViewListIcon sx={{ display: 'block' }} />}
               onClick={toggleViewMode}
               clickable
               variant="filled"
               color="info"
               sx={{ '& .MuiChip-label': { px: 1 } }}
            />
          </Tooltip>
          {sampleRestaurants.map((r) => (
            <RestaurantChip
              key={r.id}
              restaurant={r}
              isSelected={selectedRestaurant?.id === r.id}
              onClick={() => handleListItemClick(r)}
            />
          ))}
        </div>
        )}

        {/* Menu View - Visible only when in menu mode */}
        {isUserMenuMode && (
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1, overflowX: "auto", whiteSpace: "nowrap", width: '100%' }}>
            <Chip
              label="프로텐"
              onClick={handleCenterMap}
              clickable
              color="primary"
              variant="filled"
            />
            <Tooltip title="펼쳐 보기">
              <Chip
                   label={<ViewModuleIcon sx={{ display: 'block' }} />}
                   onClick={toggleViewMode}
                   clickable
                   variant="filled"
                   color="info"
                   sx={{ '& .MuiChip-label': { px: 1 } }}
              />
            </Tooltip>
            <Chip
                label="식당 선택" 
                onClick={handleMobileMenuClick} 
                icon={<MenuIcon />} 
                clickable 
                variant="outlined"
            />
            {selectedRestaurant && (
               <Chip
                label={
                  <span>
                    {selectedRestaurant.name}{" "}
                    <span style={{ fontSize: "0.85em", opacity: 0.6 }}>
                      ({selectedRestaurant.menu})
                    </span>
                  </span>
                }
                color="secondary"
               />
            )}
            <Menu
              anchorEl={mobileAnchorEl}
              open={isMobileMenuOpen}
              onClose={handleMobileMenuClose}
              PaperProps={{
                style: {
                  maxHeight: "60vh",
                  maxWidth: "90vw",
                },
              }}
            >
              <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 1, maxWidth: 600, maxHeight: 600 }}>
                {sampleRestaurants.map((r) => (
                  <RestaurantChip
                    key={r.id}
                    restaurant={r}
                    isSelected={selectedRestaurant?.id === r.id}
                    onClick={() => handleMobileSelect(r)}
                  />
                ))}
              </Box>
            </Menu>
          </Box>
        )}
      </Box>

      <Box sx={{ flexGrow: 1, width: '100%', position: 'relative' }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />
      </Box>

      {/* Restaurant detail popup – anchored to bottom-right of the card */}
      {selectedRestaurant && (
        <Paper
          elevation={6}
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            width: { xs: 'calc(100% - 32px)', sm: 320 },
            zIndex: 10,
            pt: 2, pb: 2, pl: 2,
            borderRadius: 2,
          }}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5, pr: 2 }}>
            <Typography
              component="a"
              href={naverMapSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="subtitle1"
              sx={{ fontWeight: 700, color: '#03a9f4', textDecoration: 'underline', lineHeight: 1.3, pr: 1 }}
            >
              {selectedRestaurant.name}
            </Typography>
            <IconButton size="small" onClick={() => setSelectedRestaurant(null)} sx={{ mt: -0.5, mr: -0.5 }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, pr: 2 }}>
            {selectedRestaurant.address}
          </Typography>
          <Typography variant="body2" sx={{ color: '#977162', mb: selectedRestaurant.images?.length ? 1.5 : 0, pr: 2 }}>
            {selectedRestaurant.menu}
          </Typography>

          {/* Image grid */}
          {selectedRestaurant.images && selectedRestaurant.images.length > 0 && (
            <>
              <Divider sx={{ mb: 1.5, mr: 2 }} />
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 0.5,
                  maxHeight: '28vh',
                  overflowY: 'scroll',
                  pr: 0.5,
                  '&::-webkit-scrollbar': { width: '4px' },
                  '&::-webkit-scrollbar-button': { display: 'none' },
                  '&::-webkit-scrollbar-track': { background: 'transparent' },
                  '&::-webkit-scrollbar-thumb': { background: 'rgba(0,0,0,0.25)', borderRadius: '4px' },
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(0,0,0,0.25) transparent',
                }}
              >
                {selectedRestaurant.images.map((url, idx) => (
                  <Box
                    key={idx}
                    component="img"
                    src={url}
                    alt={`${selectedRestaurant.name} 사진 ${idx + 1}`}
                    onClick={() => handleImageClick(idx)}
                    sx={{
                      width: '100%',
                      aspectRatio: '1',
                      objectFit: 'cover',
                      borderRadius: 1,
                      cursor: 'pointer',
                      transition: 'opacity 0.2s',
                      '&:hover': { opacity: 0.8 },
                    }}
                  />
                ))}
              </Box>
            </>
          )}
        </Paper>
      )}

      {/* Image Slider Modal */}
      <Modal
        open={openImageModal}
        onClose={handleCloseImageModal}
        aria-labelledby="restaurant-image-modal"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90vw',
            height: '90vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            outline: 'none',
            '.swiper-wrapper': {
              display: 'flex',
              alignItems: 'center',
            },
          }}
        >
          <IconButton
            aria-label="close"
            onClick={handleCloseImageModal}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 1301,
              color: 'white',
              backgroundColor: 'rgba(0,0,0,0.5)',
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' },
            }}
          >
            <CloseIcon />
          </IconButton>
          {openImageModal && selectedRestaurant?.images && (
            <Swiper
              modules={[Navigation, Pagination, Keyboard]}
              spaceBetween={50}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              keyboard={{ enabled: true }}
              loop
              initialSlide={imageModalSlide}
              style={{
                width: '100%',
                height: '100%',
                '--swiper-navigation-color': '#e4e4e4',
                '--swiper-pagination-color': '#e4e4e4',
              } as React.CSSProperties}
            >
              {selectedRestaurant.images.map((url, idx) => (
                <SwiperSlide key={idx}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                    <img
                      src={url}
                      alt={`${selectedRestaurant.name} 사진 ${idx + 1}`}
                      style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain' }}
                    />
                  </Box>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default RestaurantMap;
