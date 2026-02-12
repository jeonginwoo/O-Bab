import { ColorTheme } from '../types/ColorTheme';

export const initialZoom = 30;
export const canvasWidth = 1600;
export const canvasHeight = 900;
export const zoomThreshold = 5;
export const STUCK_DELAY = 5000;

export enum Skills {
  None,
  Impact,
}

export const DefaultEntityColor = {
  box: 'cyan',
  circle: 'yellow',
  polyline: 'white',
} as const;

export const DefaultBloomColor = {
  box: 'cyan',
  circle: 'yellow',
  polyline: 'cyan',
};

export const Themes: Record<string, ColorTheme> = {
  light: {
    background: '#eee',
    marbleLightness: 50,
    marbleWinningBorder: 'black',
    skillColor: '#69c',
    coolTimeIndicator: '#999',
    entity: {
      box: {
        fill: '#226f92',
        outline: 'black',
        bloom: 'cyan',
        bloomRadius: 0,
      },
      circle: {
        fill: 'yellow',
        outline: '#ed7e11',
        bloom: 'yellow',
        bloomRadius: 0,
      },
      polyline: {
        fill: 'white',
        outline: 'black',
        bloom: 'cyan',
        bloomRadius: 0,
      },
    },
    rankStroke: 'black',
    rankBackground: 'rgba(0, 0, 0, 0.5)',
    minimapBackground: '#fefefe',
    minimapViewport: '#6699cc',

    winnerBackground: 'rgba(255, 255, 255, 0.5)',
    winnerOutline: 'black',
    winnerText: '#cccccc',
    marbleGlow: 'rgba(0, 0, 0, 0.5)', // Dark glow for light theme
    marblePalette: [
      0,   // Red
      30,  // Orange
      60,  // Yellow
      120, // Green
      180, // Cyan
      210, // Blue
      270, // Purple
      300, // Magenta
      330, // Pink
    ],
  },
  dark: {
    background: 'black',
    marbleLightness: 75,
    marbleWinningBorder: 'white',
    skillColor: 'white',
    coolTimeIndicator: 'red',
    entity: {
      box: {
        fill: 'cyan',
        outline: 'cyan',
        bloom: 'cyan',
        bloomRadius: 15,
      },
      circle: {
        fill: 'yellow',
        outline: 'yellow',
        bloom: 'yellow',
        bloomRadius: 15,
      },
      polyline: {
        fill: 'white',
        outline: 'white',
        bloom: 'cyan',
        bloomRadius: 15,
      },
    },
    rankStroke: 'black',
    rankBackground: 'rgba(255, 255, 255, 0.2)',
    minimapBackground: '#333333',
    minimapViewport: 'white',
    winnerBackground: 'rgba(0, 0, 0, 0.5)',
    winnerOutline: 'black',
    winnerText: 'white',
    marbleGlow: 'rgba(255, 255, 255, 0.3)', // Light glow for dark theme
    marblePalette: [
      160, 190, 210, 260, 320, 340, 25, 50, 120
    ],
  },
};
