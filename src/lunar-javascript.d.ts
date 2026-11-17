declare module "lunar-javascript" {
  export interface EightChar {
    getYear(): string;
    getMonth(): string;
    getDay(): string;
    getTime(): string;
    setSect(sect: number): void;
  }
  export interface SolarDate {
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getLunar(): LunarDate;
  }
  export interface LunarDate {
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getSolar(): SolarDate;
    getEightChar(): EightChar;
  }
  export const Solar: {
    fromYmdHms(year: number, month: number, day: number, hour: number, minute: number, second: number): SolarDate;
  };
  export const Lunar: {
    fromYmdHms(year: number, month: number, day: number, hour: number, minute: number, second: number): LunarDate;
  };
}
