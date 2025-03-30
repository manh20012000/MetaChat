import { useState } from 'react';

type SettingItem = {
  id: string;
  label: string;
  value: boolean;
  extraInfo?: string;
};

type SettingsCategory = {
  title: string;
  items: SettingItem[];
};

const useSetting = () => {
  const [settings, setSettings] = useState<SettingsCategory[]>([
    {
      title: 'Profile',
      items: [
        { id: 'darkMode', label: 'Dark mode', value: false, extraInfo: 'System' },
        { id: 'activeStatus', label: 'Active status', value: true, extraInfo: 'On' },
        { id: 'username', label: 'Username', value: false, extraInfo: 'm.me/manh.le.494606' },
      ],
    },
    {
      title: 'For families',
      items: [
        { id: 'familyCenter', label: 'Family Center', value: true },
      ],
    },
    {
      title: 'Services',
      items: [
        { id: 'orders', label: 'Orders', value: true },
        { id: 'payments', label: 'Payments', value: false },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { id: 'avatar', label: 'Avatar', value: true },
        { id: 'notifications', label: 'Notifications & sounds', value: false },
        { id: 'accessibility', label: 'Accessibility', value: false },
        { id: 'privacy', label: 'Privacy & safety', value: false },
      ],
    },
  ]);

  const toggleSetting = (categoryIndex: number, itemId: string) => {
    setSettings(prevSettings => {
      const newSettings = [...prevSettings];
      const category = newSettings[categoryIndex];
      const itemIndex = category.items.findIndex(item => item.id === itemId);
      
      if (itemIndex !== -1) {
        const newItems = [...category.items];
        newItems[itemIndex] = {
          ...newItems[itemIndex],
          value: !newItems[itemIndex].value
        };
        
        newSettings[categoryIndex] = {
          ...category,
          items: newItems
        };
      }
      
      return newSettings;
    });
  };

  return { settings, toggleSetting };
};

export default useSetting;