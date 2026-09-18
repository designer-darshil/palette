import { ColorItem } from '../types';
import rawColorsJson from './colors.json?raw';

export const CURATED_COLORS: ColorItem[] = JSON.parse(rawColorsJson) as ColorItem[];
