window.BARASHI_DATA_PAYLOAD = {
  cols: [
    { name: 'Bike', side: 'elem', order: 0 },
    { name: 'Subsystem', side: 'elem', order: 1 },
    { name: 'Requirement', side: 'req', order: 0 }
  ],
  nodes: [
    { name: 'Bike', col: 'Bike' },
    { name: 'Frame', col: 'Subsystem' },
    { name: 'Brake', col: 'Subsystem' },
    { name: 'Headlamp', col: 'Subsystem' },
    { name: 'Stable posture', col: 'Requirement' },
    { name: 'Safe stop', col: 'Requirement' },
    { name: 'Visibility', col: 'Requirement' }
  ],
  links: [
    { from: 'Bike', to: 'Frame', strength: 'strong' },
    { from: 'Bike', to: 'Brake', strength: 'strong' },
    { from: 'Bike', to: 'Headlamp', strength: 'mid' },
    { from: 'Frame', to: 'Stable posture', strength: 'mid' },
    { from: 'Brake', to: 'Safe stop', strength: 'strong' },
    { from: 'Headlamp', to: 'Visibility', strength: 'strong' }
  ]
};
