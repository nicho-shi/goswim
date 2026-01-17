
export type Gender = 'Boys' | 'Girls';
export type Course = 'SCM' | 'LCM';
export type Level = 'Level 1' | 'Level 2';

// Helper function to convert time format: "2.28.54" -> "2:28.54"
const convertTimeFormat = (timeStr: string): string => {
  // If already in MM:SS.hh format, return as is
  if (timeStr.includes(':')) {
    return timeStr;
  }
  
  // Convert "2.28.54" format to "2:28.54"
  // Split by dots
  const parts = timeStr.split('.');
  
  if (parts.length === 3) {
    // Format: M.SS.hh -> M:SS.hh
    return `${parts[0]}:${parts[1]}.${parts[2]}`;
  } else if (parts.length === 2) {
    // Format: SS.hh -> keep as is
    return timeStr;
  }
  
  return timeStr;
};

// Helper function to parse age group: "12/u" -> {maxAge: 12}, "13-14" -> {minAge: 13, maxAge: 14}, "15/0" -> {minAge: 15}
const parseAgeGroup = (ageGroup: string): { minAge?: number; maxAge?: number } => {
  ageGroup = ageGroup.trim().toLowerCase();
  
  // Format: "12/u" or "11/u" -> maxAge
  if (ageGroup.includes('/u')) {
    const age = parseInt(ageGroup.replace('/u', ''));
    return { maxAge: age };
  }
  
  // Format: "15/0" or "16/0" or "17/0" -> minAge
  if (ageGroup.includes('/0')) {
    const age = parseInt(ageGroup.replace('/0', ''));
    return { minAge: age };
  }
  
  // Format: "13-14" or "13-14yr" or "15-16yr" -> minAge and maxAge
  if (ageGroup.includes('-')) {
    const parts = ageGroup.replace('yr', '').split('-');
    const minAge = parseInt(parts[0]);
    const maxAge = parseInt(parts[1]);
    return { minAge, maxAge };
  }
  
  return {};
};

// Helper function to convert stroke abbreviation to full name
const convertStroke = (abbr: string): string => {
  const strokeMap: Record<string, string> = {
    'Fr': 'Freestyle',
    'Bk': 'Backstroke',
    'Br': 'Breaststroke',
    'Fly': 'Butterfly',
    'IM': 'IM'
  };
  return strokeMap[abbr] || abbr;
};

// Helper function to convert event key to full event name
const convertEventKey = (eventKey: string): string => {
  // Format: "100 Fr" -> "100m Freestyle"
  const match = eventKey.match(/(\d+)\s+(\w+)/);
  if (match) {
    const distance = match[1];
    const stroke = convertStroke(match[2]);
    return `${distance}m ${stroke}`;
  }
  return eventKey;
};

export const ASA_DATA: any = {
  Girls: {
    "Level 1": {
      LCM: {
        "100m Freestyle": [{ maxAge: 12, time: "1:07.98" }, { minAge: 13, maxAge: 14, time: "1:07.47" }, { minAge: 15, time: "1:06.98" }],
        "200m Freestyle": [{ maxAge: 12, time: "2:28.54" }, { minAge: 13, maxAge: 14, time: "2:27.43" }, { minAge: 15, time: "2:26.35" }],
        "400m Freestyle": [{ maxAge: 12, time: "5:10.89" }, { minAge: 13, maxAge: 14, time: "5:08.56" }, { minAge: 15, time: "5:06.31" }],
        "800m Freestyle": [{ maxAge: 12, time: "10:37.38" }, { minAge: 13, maxAge: 14, time: "10:32.62" }, { minAge: 15, time: "10:28.01" }],
        "1500m Freestyle": [{ maxAge: 12, time: "20:10.21" }, { minAge: 13, maxAge: 14, time: "20:01.18" }, { minAge: 15, time: "19:52.41" }],
        "100m Backstroke": [{ maxAge: 12, time: "1:18.71" }, { minAge: 13, maxAge: 14, time: "1:18.07" }, { minAge: 15, time: "1:17.44" }],
        "200m Backstroke": [{ maxAge: 12, time: "2:48.37" }, { minAge: 13, maxAge: 14, time: "2:46.99" }, { minAge: 15, time: "2:45.65" }],
        "100m Breaststroke": [{ maxAge: 12, time: "1:27.03" }, { minAge: 13, maxAge: 14, time: "1:26.32" }, { minAge: 15, time: "1:25.63" }],
        "200m Breaststroke": [{ maxAge: 12, time: "3:08.80" }, { minAge: 13, maxAge: 14, time: "3:07.25" }, { minAge: 15, time: "3:05.75" }],
        "100m Butterfly": [{ maxAge: 12, time: "1:15.29" }, { minAge: 13, maxAge: 14, time: "1:14.68" }, { minAge: 15, time: "1:14.08" }],
        "200m Butterfly": [{ maxAge: 12, time: "2:45.32" }, { minAge: 13, maxAge: 14, time: "2:43.96" }, { minAge: 15, time: "2:42.65" }],
        "200m IM": [{ maxAge: 12, time: "2:51.17" }, { minAge: 13, maxAge: 14, time: "2:49.79" }, { minAge: 15, time: "2:48.40" }],
        "400m IM": [{ maxAge: 12, time: "6:01.50" }, { minAge: 13, maxAge: 14, time: "5:58.54" }, { minAge: 15, time: "5:55.67" }]
      },
      SCM: {
        "100m Freestyle": [{ maxAge: 12, time: "1:06.06" }, { minAge: 13, maxAge: 14, time: "1:05.57" }, { minAge: 15, time: "1:05.09" }],
        "200m Freestyle": [{ maxAge: 12, time: "2:25.18" }, { minAge: 13, maxAge: 14, time: "2:24.10" }, { minAge: 15, time: "2:23.05" }],
        "400m Freestyle": [{ maxAge: 12, time: "5:07.55" }, { minAge: 13, maxAge: 14, time: "5:05.25" }, { minAge: 15, time: "5:03.02" }],
        "800m Freestyle": [{ maxAge: 12, time: "10:30.22" }, { minAge: 13, maxAge: 14, time: "10:25.51" }, { minAge: 15, time: "10:20.95" }],
        "1500m Freestyle": [{ maxAge: 12, time: "20:09.20" }, { minAge: 13, maxAge: 14, time: "20:00.18" }, { minAge: 15, time: "19:51.42" }],
        "100m Backstroke": [{ maxAge: 12, time: "1:14.68" }, { minAge: 13, maxAge: 14, time: "1:14.07" }, { minAge: 15, time: "1:13.48" }],
        "200m Backstroke": [{ maxAge: 12, time: "2:41.82" }, { minAge: 13, maxAge: 14, time: "2:40.49" }, { minAge: 15, time: "2:39.20" }],
        "100m Breaststroke": [{ maxAge: 12, time: "1:24.63" }, { minAge: 13, maxAge: 14, time: "1:23.94" }, { minAge: 15, time: "1:23.27" }],
        "200m Breaststroke": [{ maxAge: 12, time: "3:02.63" }, { minAge: 13, maxAge: 14, time: "3:01.14" }, { minAge: 15, time: "2:59.69" }],
        "100m Butterfly": [{ maxAge: 12, time: "1:14.11" }, { minAge: 13, maxAge: 14, time: "1:13.50" }, { minAge: 15, time: "1:12.92" }],
        "200m Butterfly": [{ maxAge: 12, time: "2:42.33" }, { minAge: 13, maxAge: 14, time: "2:41.00" }, { minAge: 15, time: "2:39.71" }],
        "100m IM": [{ maxAge: 12, time: "1:16.69" }, { minAge: 13, maxAge: 14, time: "1:16.06" }, { minAge: 15, time: "1:15.45" }],
        "200m IM": [{ maxAge: 12, time: "2:45.38" }, { minAge: 13, maxAge: 14, time: "2:44.03" }, { minAge: 15, time: "2:42.72" }],
        "400m IM": [{ maxAge: 12, time: "5:51.43" }, { minAge: 13, maxAge: 14, time: "5:48.55" }, { minAge: 15, time: "5:45.76" }]
      }
    },
    "Level 2": {
      LCM: {
        "100m Freestyle": [{ maxAge: 11, time: "1:23.20" }, { minAge: 12, maxAge: 13, time: "1:21.01" }, { minAge: 14, maxAge: 15, time: "1:19.04" }, { minAge: 16, time: "1:17.24" }],
        "200m Freestyle": [{ maxAge: 11, time: "3:01.80" }, { minAge: 12, maxAge: 13, time: "2:57.01" }, { minAge: 14, maxAge: 15, time: "2:52.69" }, { minAge: 16, time: "2:48.76" }],
        "400m Freestyle": [{ maxAge: 11, time: "6:20.49" }, { minAge: 12, maxAge: 13, time: "6:10.48" }, { minAge: 14, maxAge: 15, time: "6:01.44" }, { minAge: 16, time: "5:53.22" }],
        "800m Freestyle": [{ maxAge: 11, time: "13:00.09" }, { minAge: 12, maxAge: 13, time: "12:39.56" }, { minAge: 14, maxAge: 15, time: "12:21.02" }, { minAge: 16, time: "12:04.18" }],
        "1500m Freestyle": [{ maxAge: 11, time: "24:41.18" }, { minAge: 12, maxAge: 13, time: "24:02.19" }, { minAge: 14, maxAge: 15, time: "23:27.00" }, { minAge: 16, time: "22:55.01" }],
        "100m Backstroke": [{ maxAge: 11, time: "1:37.57" }, { minAge: 12, maxAge: 13, time: "1:34.66" }, { minAge: 14, maxAge: 15, time: "1:32.06" }, { minAge: 16, time: "1:29.73" }],
        "200m Backstroke": [{ maxAge: 11, time: "3:28.71" }, { minAge: 12, maxAge: 13, time: "3:22.48" }, { minAge: 14, maxAge: 15, time: "3:16.93" }, { minAge: 16, time: "3:11.94" }],
        "100m Breaststroke": [{ maxAge: 11, time: "1:47.89" }, { minAge: 12, maxAge: 13, time: "1:44.66" }, { minAge: 14, maxAge: 15, time: "1:41.80" }, { minAge: 16, time: "1:39.22" }],
        "200m Breaststroke": [{ maxAge: 11, time: "3:54.03" }, { minAge: 12, maxAge: 13, time: "3:47.04" }, { minAge: 14, maxAge: 15, time: "3:40.82" }, { minAge: 16, time: "3:35.23" }],
        "100m Butterfly": [{ maxAge: 11, time: "1:33.33" }, { minAge: 12, maxAge: 13, time: "1:30.55" }, { minAge: 14, maxAge: 15, time: "1:28.06" }, { minAge: 16, time: "1:25.83" }],
        "200m Butterfly": [{ maxAge: 11, time: "3:24.93" }, { minAge: 12, maxAge: 13, time: "3:18.81" }, { minAge: 14, maxAge: 15, time: "3:13.36" }, { minAge: 16, time: "3:08.46" }],
        "200m IM": [{ maxAge: 11, time: "3:32.18" }, { minAge: 12, maxAge: 13, time: "3:25.84" }, { minAge: 14, maxAge: 15, time: "3:20.20" }, { minAge: 16, time: "3:15.13" }],
        "400m IM": [{ maxAge: 11, time: "7:28.12" }, { minAge: 12, maxAge: 13, time: "7:14.73" }, { minAge: 14, maxAge: 15, time: "7:02.82" }, { minAge: 16, time: "6:52.11" }]
      },
      SCM: {
        "100m Freestyle": [{ maxAge: 11, time: "1:20.85" }, { minAge: 12, maxAge: 13, time: "1:18.73" }, { minAge: 14, maxAge: 15, time: "1:16.80" }, { minAge: 16, time: "1:15.06" }],
        "200m Freestyle": [{ maxAge: 11, time: "2:57.69" }, { minAge: 12, maxAge: 13, time: "2:53.01" }, { minAge: 14, maxAge: 15, time: "2:48.79" }, { minAge: 16, time: "2:44.96" }],
        "400m Freestyle": [{ maxAge: 11, time: "6:16.41" }, { minAge: 12, maxAge: 13, time: "6:06.50" }, { minAge: 14, maxAge: 15, time: "5:57.55" }, { minAge: 16, time: "5:49.43" }],
        "800m Freestyle": [{ maxAge: 11, time: "12:51.32" }, { minAge: 12, maxAge: 13, time: "12:31.02" }, { minAge: 14, maxAge: 15, time: "12:12.69" }, { minAge: 16, time: "11:56.03" }],
        "1500m Freestyle": [{ maxAge: 11, time: "24:39.95" }, { minAge: 12, maxAge: 13, time: "24:00.98" }, { minAge: 14, maxAge: 15, time: "23:25.82" }, { minAge: 16, time: "22:53.86" }],
        "100m Backstroke": [{ maxAge: 11, time: "1:32.58" }, { minAge: 12, maxAge: 13, time: "1:29.81" }, { minAge: 14, maxAge: 15, time: "1:27.35" }, { minAge: 16, time: "1:25.14" }],
        "200m Backstroke": [{ maxAge: 11, time: "3:20.59" }, { minAge: 12, maxAge: 13, time: "3:14.60" }, { minAge: 14, maxAge: 15, time: "3:09.26" }, { minAge: 16, time: "3:04.47" }],
        "100m Breaststroke": [{ maxAge: 11, time: "1:44.91" }, { minAge: 12, maxAge: 13, time: "1:41.78" }, { minAge: 14, maxAge: 15, time: "1:38.99" }, { minAge: 16, time: "1:36.48" }],
        "200m Breaststroke": [{ maxAge: 11, time: "3:46.39" }, { minAge: 12, maxAge: 13, time: "3:39.63" }, { minAge: 14, maxAge: 15, time: "3:33.61" }, { minAge: 16, time: "3:28.20" }],
        "100m Butterfly": [{ maxAge: 11, time: "1:31.87" }, { minAge: 12, maxAge: 13, time: "1:29.13" }, { minAge: 14, maxAge: 15, time: "1:26.68" }, { minAge: 16, time: "1:24.49" }],
        "200m Butterfly": [{ maxAge: 11, time: "3:21.23" }, { minAge: 12, maxAge: 13, time: "3:15.22" }, { minAge: 14, maxAge: 15, time: "3:09.86" }, { minAge: 16, time: "3:05.06" }],
        "100m IM": [{ maxAge: 11, time: "1:35.07" }, { minAge: 12, maxAge: 13, time: "1:32.23" }, { minAge: 14, maxAge: 15, time: "1:29.70" }, { minAge: 16, time: "1:27.43" }],
        "200m IM": [{ maxAge: 11, time: "3:25.01" }, { minAge: 12, maxAge: 13, time: "3:18.89" }, { minAge: 14, maxAge: 15, time: "3:13.44" }, { minAge: 16, time: "3:08.54" }],
        "400m IM": [{ maxAge: 11, time: "7:15.63" }, { minAge: 12, maxAge: 13, time: "7:02.62" }, { minAge: 14, maxAge: 15, time: "6:51.04" }, { minAge: 16, time: "6:40.43" }]
      }
    }
  },
  Boys: {
    "Level 1": {
      LCM: {
        "100m Freestyle": [{ maxAge: 13, time: "1:04.76" }, { minAge: 14, maxAge: 15, time: "1:03.14" }, { minAge: 16, time: "1:01.67" }],
        "200m Freestyle": [{ maxAge: 13, time: "2:20.82" }, { minAge: 14, maxAge: 15, time: "2:17.30" }, { minAge: 16, time: "2:14.10" }],
        "400m Freestyle": [{ maxAge: 13, time: "5:03.83" }, { minAge: 14, maxAge: 15, time: "4:56.23" }, { minAge: 16, time: "4:49.34" }],
        "800m Freestyle": [{ maxAge: 13, time: "10:24.20" }, { minAge: 14, maxAge: 15, time: "10:08.59" }, { minAge: 16, time: "9:54.43" }],
        "1500m Freestyle": [{ maxAge: 13, time: "20:02.54" }, { minAge: 14, maxAge: 15, time: "19:32.46" }, { minAge: 16, time: "19:05.18" }],
        "100m Backstroke": [{ maxAge: 13, time: "1:15.03" }, { minAge: 14, maxAge: 15, time: "1:14.28" }, { minAge: 16, time: "1:13.57" }],
        "200m Backstroke": [{ maxAge: 13, time: "2:41.95" }, { minAge: 14, maxAge: 15, time: "2:40.35" }, { minAge: 16, time: "2:38.81" }],
        "100m Breaststroke": [{ maxAge: 13, time: "1:22.62" }, { minAge: 14, maxAge: 15, time: "1:21.81" }, { minAge: 16, time: "1:21.02" }],
        "200m Breaststroke": [{ maxAge: 13, time: "3:03.30" }, { minAge: 14, maxAge: 15, time: "3:01.48" }, { minAge: 16, time: "2:59.74" }],
        "100m Butterfly": [{ maxAge: 13, time: "1:12.09" }, { minAge: 14, maxAge: 15, time: "1:11.38" }, { minAge: 16, time: "1:10.69" }],
        "200m Butterfly": [{ maxAge: 13, time: "2:41.36" }, { minAge: 14, maxAge: 15, time: "2:39.76" }, { minAge: 16, time: "2:38.23" }],
        "200m IM": [{ maxAge: 13, time: "2:44.96" }, { minAge: 14, maxAge: 15, time: "2:43.33" }, { minAge: 16, time: "2:41.76" }],
        "400m IM": [{ maxAge: 13, time: "5:52.85" }, { minAge: 14, maxAge: 15, time: "5:49.36" }, { minAge: 16, time: "5:46.00" }]
      },
      SCM: {
        "100m Freestyle": [{ maxAge: 13, time: "1:02.04" }, { minAge: 14, maxAge: 15, time: "1:00.49" }, { minAge: 16, time: "59.08" }],
        "200m Freestyle": [{ maxAge: 13, time: "2:17.19" }, { minAge: 14, maxAge: 15, time: "2:13.76" }, { minAge: 16, time: "2:10.64" }],
        "400m Freestyle": [{ maxAge: 13, time: "4:53.03" }, { minAge: 14, maxAge: 15, time: "4:45.70" }, { minAge: 16, time: "4:39.05" }],
        "800m Freestyle": [{ maxAge: 13, time: "10:12.19" }, { minAge: 14, maxAge: 15, time: "9:56.88" }, { minAge: 16, time: "9:42.99" }],
        "1500m Freestyle": [{ maxAge: 13, time: "19:30.84" }, { minAge: 14, maxAge: 15, time: "19:01.55" }, { minAge: 16, time: "18:35.00" }],
        "100m Backstroke": [{ maxAge: 13, time: "1:10.73" }, { minAge: 14, maxAge: 15, time: "1:10.03" }, { minAge: 16, time: "1:09.35" }],
        "200m Backstroke": [{ maxAge: 13, time: "2:32.85" }, { minAge: 14, maxAge: 15, time: "2:31.34" }, { minAge: 16, time: "2:29.88" }],
        "100m Breaststroke": [{ maxAge: 13, time: "1:20.47" }, { minAge: 14, maxAge: 15, time: "1:19.67" }, { minAge: 16, time: "1:18.90" }],
        "200m Breaststroke": [{ maxAge: 13, time: "2:53.88" }, { minAge: 14, maxAge: 15, time: "2:52.16" }, { minAge: 16, time: "2:50.50" }],
        "100m Butterfly": [{ maxAge: 13, time: "1:09.57" }, { minAge: 14, maxAge: 15, time: "1:08.88" }, { minAge: 16, time: "1:08.22" }],
        "200m Butterfly": [{ maxAge: 13, time: "2:36.63" }, { minAge: 14, maxAge: 15, time: "2:35.08" }, { minAge: 16, time: "2:33.59" }],
        "100m IM": [{ maxAge: 13, time: "1:12.73" }, { minAge: 14, maxAge: 15, time: "1:12.01" }, { minAge: 16, time: "1:11.31" }],
        "200m IM": [{ maxAge: 13, time: "2:38.64" }, { minAge: 14, maxAge: 15, time: "2:37.07" }, { minAge: 16, time: "2:35.56" }],
        "400m IM": [{ maxAge: 13, time: "5:40.78" }, { minAge: 14, maxAge: 15, time: "5:37.41" }, { minAge: 16, time: "5:34.17" }]
      }
    },
    "Level 2": {
      LCM: {
        "100m Freestyle": [{ maxAge: 12, time: "1:18.92" }, { minAge: 13, maxAge: 14, time: "1:15.48" }, { minAge: 15, maxAge: 16, time: "1:12.57" }, { minAge: 17, time: "1:10.07" }],
        "200m Freestyle": [{ maxAge: 12, time: "2:51.61" }, { minAge: 13, maxAge: 14, time: "2:44.13" }, { minAge: 15, maxAge: 16, time: "2:37.81" }, { minAge: 17, time: "2:32.36" }],
        "400m Freestyle": [{ maxAge: 12, time: "6:10.24" }, { minAge: 13, maxAge: 14, time: "5:54.12" }, { minAge: 15, maxAge: 16, time: "5:40.49" }, { minAge: 17, time: "5:28.74" }],
        "800m Freestyle": [{ maxAge: 12, time: "12:40.64" }, { minAge: 13, maxAge: 14, time: "12:07.52" }, { minAge: 15, maxAge: 16, time: "11:39.51" }, { minAge: 17, time: "11:15.37" }],
        "1500m Freestyle": [{ maxAge: 12, time: "24:25.39" }, { minAge: 13, maxAge: 14, time: "23:21.60" }, { minAge: 15, maxAge: 16, time: "22:27.63" }, { minAge: 17, time: "21:41.13" }],
        "100m Backstroke": [{ maxAge: 12, time: "1:30.19" }, { minAge: 13, maxAge: 14, time: "1:28.66" }, { minAge: 15, maxAge: 16, time: "1:25.88" }, { minAge: 17, time: "1:22.30" }],
        "200m Backstroke": [{ maxAge: 12, time: "3:14.68" }, { minAge: 13, maxAge: 14, time: "3:11.38" }, { minAge: 15, maxAge: 16, time: "3:05.39" }, { minAge: 17, time: "2:57.66" }],
        "100m Breaststroke": [{ maxAge: 12, time: "1:39.32" }, { minAge: 13, maxAge: 14, time: "1:37.63" }, { minAge: 15, maxAge: 16, time: "1:34.58" }, { minAge: 17, time: "1:30.64" }],
        "200m Breaststroke": [{ maxAge: 12, time: "3:40.33" }, { minAge: 13, maxAge: 14, time: "3:36.60" }, { minAge: 15, maxAge: 16, time: "3:29.82" }, { minAge: 17, time: "3:21.07" }],
        "100m Butterfly": [{ maxAge: 12, time: "1:26.66" }, { minAge: 13, maxAge: 14, time: "1:25.19" }, { minAge: 15, maxAge: 16, time: "1:22.52" }, { minAge: 17, time: "1:19.08" }],
        "200m Butterfly": [{ maxAge: 12, time: "3:13.96" }, { minAge: 13, maxAge: 14, time: "3:10.67" }, { minAge: 15, maxAge: 16, time: "3:04.71" }, { minAge: 17, time: "2:57.01" }],
        "200m IM": [{ maxAge: 12, time: "3:18.29" }, { minAge: 13, maxAge: 14, time: "3:14.93" }, { minAge: 15, maxAge: 16, time: "3:08.84" }, { minAge: 17, time: "3:00.96" }],
        "400m IM": [{ maxAge: 12, time: "7:04.15" }, { minAge: 13, maxAge: 14, time: "6:56.96" }, { minAge: 15, maxAge: 16, time: "6:43.92" }, { minAge: 17, time: "6:27.07" }]
      },
      SCM: {
        "100m Freestyle": [{ maxAge: 12, time: "1:15.60" }, { minAge: 13, maxAge: 14, time: "1:12.31" }, { minAge: 15, maxAge: 16, time: "1:09.53" }, { minAge: 17, time: "1:07.13" }],
        "200m Freestyle": [{ maxAge: 12, time: "2:47.17" }, { minAge: 13, maxAge: 14, time: "2:39.90" }, { minAge: 15, maxAge: 16, time: "2:33.74" }, { minAge: 17, time: "2:28.43" }],
        "400m Freestyle": [{ maxAge: 12, time: "5:57.08" }, { minAge: 13, maxAge: 14, time: "5:41.54" }, { minAge: 15, maxAge: 16, time: "5:28.39" }, { minAge: 17, time: "5:17.05" }],
        "800m Freestyle": [{ maxAge: 12, time: "12:26.00" }, { minAge: 13, maxAge: 14, time: "11:53.52" }, { minAge: 15, maxAge: 16, time: "11:26.05" }, { minAge: 17, time: "11:02.38" }],
        "1500m Freestyle": [{ maxAge: 12, time: "23:46.76" }, { minAge: 13, maxAge: 14, time: "22:44.65" }, { minAge: 15, maxAge: 16, time: "21:52.11" }, { minAge: 17, time: "21:06.83" }],
        "100m Backstroke": [{ maxAge: 12, time: "1:25.02" }, { minAge: 13, maxAge: 14, time: "1:23.58" }, { minAge: 15, maxAge: 16, time: "1:20.96" }, { minAge: 17, time: "1:17.59" }],
        "200m Backstroke": [{ maxAge: 12, time: "3:03.73" }, { minAge: 13, maxAge: 14, time: "3:00.62" }, { minAge: 15, maxAge: 16, time: "2:54.97" }, { minAge: 17, time: "2:47.67" }],
        "100m Breaststroke": [{ maxAge: 12, time: "1:36.73" }, { minAge: 13, maxAge: 14, time: "1:35.09" }, { minAge: 15, maxAge: 16, time: "1:32.11" }, { minAge: 17, time: "1:28.27" }],
        "200m Breaststroke": [{ maxAge: 12, time: "3:29.01" }, { minAge: 13, maxAge: 14, time: "3:25.47" }, { minAge: 15, maxAge: 16, time: "3:19.04" }, { minAge: 17, time: "3:10.74" }],
        "100m Butterfly": [{ maxAge: 12, time: "1:23.63" }, { minAge: 13, maxAge: 14, time: "1:22.21" }, { minAge: 15, maxAge: 16, time: "1:19.64" }, { minAge: 17, time: "1:16.32" }],
        "200m Butterfly": [{ maxAge: 12, time: "3:08.27" }, { minAge: 13, maxAge: 14, time: "3:05.08" }, { minAge: 15, maxAge: 16, time: "2:59.29" }, { minAge: 17, time: "2:51.82" }],
        "100m IM": [{ maxAge: 12, time: "1:27.42" }, { minAge: 13, maxAge: 14, time: "1:25.94" }, { minAge: 15, maxAge: 16, time: "1:23.25" }, { minAge: 17, time: "1:19.78" }],
        "200m IM": [{ maxAge: 12, time: "3:10.69" }, { minAge: 13, maxAge: 14, time: "3:07.46" }, { minAge: 15, maxAge: 16, time: "3:01.60" }, { minAge: 17, time: "2:54.02" }],
        "400m IM": [{ maxAge: 12, time: "6:49.64" }, { minAge: 13, maxAge: 14, time: "6:42.69" }, { minAge: 15, maxAge: 16, time: "6:30.10" }, { minAge: 17, time: "6:13.83" }]
      }
    }
  }
};

export function getAsaStandard(
  gender: Gender,
  level: Level,
  course: Course,
  stroke: string,
  distance: string,
  age: number
): string | null {
  const eventName = `${distance} ${stroke}`;
  const eventData = ASA_DATA[gender]?.[level]?.[course]?.[eventName];
  if (!eventData) return null;

  for (const range of eventData) {
    if (range.maxAge && !range.minAge && age <= range.maxAge) return range.time;
    if (range.minAge && range.maxAge && age >= range.minAge && age <= range.maxAge) return range.time;
    if (range.minAge && !range.maxAge && age >= range.minAge) return range.time;
  }
  return null;
}
