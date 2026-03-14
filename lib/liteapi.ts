/**
 * LiteAPI configuration and utilities.
 * Set NEXT_PUBLIC_LITEAPI_DOMAIN in your .env (e.g. "yourbrand.nuitee.link")
 */

export const LITEAPI_DOMAIN = process.env.NEXT_PUBLIC_LITEAPI_DOMAIN ?? "";
export const LITEAPI_BRAND_COLOR = "#2F7C9C";
export const LITEAPI_SDK_URL = "https://components.liteapi.travel/v1.0/sdk.umd.js";

/** Google Place IDs for Canadian cities — used by the Map & HotelsList widgets */
export const CITY_PLACE_IDS: Record<string, string> = {
  "toronto-downtown":    "ChIJpTvG15DL1IkRd8S0KlBVNTI",
  "vancouver-downtown":  "ChIJs0-pQ_FzhlQRi_OBm-qWkbs",
  "montreal-downtown":   "ChIJmzU7E0veyUwRqJMHRSFQiKg",
  "calgary-downtown":    "ChIJ1T-EnwNwcVMROrZStrE7bSY",
  banff:                 "ChIJc3ab3P8IcVMRoSTmc3sERkY",
  whistler:              "ChIJ8e5VWh1whVQRpN4a9phzFps",
  "quebec-city":         "ChIJJ7EnuW71y0wROx2kSSa7ygo",
  ottawa:                "ChIJrxNRX7IFzkwR7RXdMeFRaoo",
  "niagara-falls":       "ChIJhUrHDFuW04kR35gZFsG9iG4",
  "victoria-bc":         "ChIJV5eFXFJ3hlQRsHoHxQlOJ_M",
  halifax:               "ChIJSU0LsaJnWUsRUD6csFELlIM",
  edmonton:              "ChIJx9Xd9_ZoaUcRh-8Z0jJSVAc",
  saskatoon:             "ChIJtZJyqj5kS1MRyHIGCiPFYys",
  winnipeg:              "ChIJ8-n5PFUrDlMRiMpEAW1OWLE",
  kelowna:               "ChIJM0bDZ5O2fVMRU4bPMPVjfzs",
  toronto:               "ChIJpTvG15DL1IkRd8S0KlBVNTI",
  vancouver:             "ChIJs0-pQ_FzhlQRi_OBm-qWkbs",
  montreal:              "ChIJmzU7E0veyUwRqJMHRSFQiKg",
  calgary:               "ChIJ1T-EnwNwcVMROrZStrE7bSY",
};

/** Declare LiteAPI global on window */
declare global {
  interface Window {
    LiteAPI?: {
      init: (config: { domain: string }) => void;
      SearchBar: {
        create: (config: {
          selector: string;
          primaryColor?: string;
          deepLinkParams?: Record<string, string | number | boolean>;
          labelsOverride?: Record<string, string>;
          onSearchClick?: (params: unknown) => void;
        }) => void;
      };
      Map: {
        create: (config: {
          selector: string;
          placeId?: string;
          primaryColor?: string;
          currency?: string;
          hideLogo?: boolean;
          onHotelClick?: (hotel: unknown) => void;
          deepLinkParams?: Record<string, string | number | boolean>;
        }) => void;
      };
      HotelsList: {
        create: (config: {
          selector: string;
          placeId?: string;
          primaryColor?: string;
          hasSearchBar?: boolean;
          rows?: number;
          currency?: string;
          onHotelClick?: (hotel: unknown) => void;
          deepLinkParams?: Record<string, string | number | boolean>;
        }) => void;
      };
    };
  }
}
