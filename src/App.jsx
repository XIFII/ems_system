import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  LayoutDashboard, Zap, ShieldAlert, Activity, Settings, 
  Database, Bell, Wrench, RefreshCw, LogOut, Search,
  Wifi, BatteryMedium, Clock, CheckCircle2, Radio,
  AlertTriangle, Play, Square, Plus, Trash2, Edit3, Save,
  Cloud, Cpu, ShieldCheck, GitBranch, ZapOff, Power, BarChart2,
  CloudRain, TrendingUp, DownloadCloud, UploadCloud, ChevronRight, Copy,
  LineChart, Sun, DollarSign, Sparkles, X, CalendarDays, Loader2,
  ArrowUp, ArrowDown, GripVertical
} from 'lucide-react';

const availableCollectorDevices = [
  {
    id: 'envio-a01',
    name: 'EnvIO-A01',
    category: '储能柜动环采集器',
    group: '1#储能柜',
    status: 'online',
    pointStats: { di: 8, do: 4 },
    modelSource: 'Modbus TCP / 16点IO',
  },
  {
    id: 'envio-b01',
    name: 'EnvIO-B01',
    category: '公辅动环采集器',
    group: '公辅系统',
    status: 'online',
    pointStats: { di: 4, do: 3 },
    modelSource: 'RS485 / 8点IO',
  },
  {
    id: 'envio-c01',
    name: 'EnvIO-C01',
    category: '预留采集器',
    group: '2#储能柜',
    status: 'offline',
    pointStats: { di: 2, do: 2 },
    modelSource: '待接入',
  },
  {
    id: 'envio-d01',
    name: 'EnvIO-D01',
    category: '配电房采集器',
    group: '站级配电',
    status: 'online',
    pointStats: { di: 4, do: 2 },
    modelSource: 'Modbus RTU / 8点IO',
  },
];

const initialCollectorDevices = availableCollectorDevices.filter((item) =>
  ['envio-a01', 'envio-b01'].includes(item.id)
);

const initialSignalPoints = [
  {
    id: 'envio-a01-DI1',
    collectorDeviceId: 'envio-a01',
    pointCode: 'DI1',
    displayName: '水浸',
    direction: 'DI',
    originModelName: 'water_leak_alarm',
    triggerType: '0->1',
    categoryOrPriority: '消防告警',
    enabled: true,
    remark: '储能柜底部水浸绳',
  },
  {
    id: 'envio-a01-DI2',
    collectorDeviceId: 'envio-a01',
    pointCode: 'DI2',
    displayName: '烟感',
    direction: 'DI',
    originModelName: 'smoke_alarm',
    triggerType: '0->1',
    categoryOrPriority: '消防告警',
    enabled: true,
    remark: '电池舱顶部烟感',
  },
  {
    id: 'envio-a01-DI3',
    collectorDeviceId: 'envio-a01',
    pointCode: 'DI3',
    displayName: '灭火装置',
    direction: 'DI',
    originModelName: 'fire_extinguisher_action',
    triggerType: '0->1',
    categoryOrPriority: '消防联锁',
    enabled: true,
    remark: '灭火装置动作反馈',
  },
  {
    id: 'envio-a01-DI4',
    collectorDeviceId: 'envio-a01',
    pointCode: 'DI4',
    displayName: '浪涌',
    direction: 'DI',
    originModelName: 'surge_alarm',
    triggerType: '0->1',
    categoryOrPriority: '设备保护',
    enabled: true,
    remark: '配电柜浪涌保护告警',
  },
  {
    id: 'envio-a01-DI5',
    collectorDeviceId: 'envio-a01',
    pointCode: 'DI5',
    displayName: '门禁',
    direction: 'DI',
    originModelName: 'door_status',
    triggerType: '0 / 1',
    categoryOrPriority: '安防状态',
    enabled: true,
    remark: '0 开门 / 1 关门',
  },
  {
    id: 'envio-a01-DI6',
    collectorDeviceId: 'envio-a01',
    pointCode: 'DI6',
    displayName: '可燃气体',
    direction: 'DI',
    originModelName: 'gas_alarm',
    triggerType: '0->1',
    categoryOrPriority: '消防告警',
    enabled: true,
    remark: '可燃气体检测',
  },
  {
    id: 'envio-a01-DI7',
    collectorDeviceId: 'envio-a01',
    pointCode: 'DI7',
    displayName: '急停',
    direction: 'DI',
    originModelName: 'emergency_stop',
    triggerType: '1->0',
    categoryOrPriority: '紧急停机',
    enabled: true,
    remark: '急停按钮 SB1',
  },
  {
    id: 'envio-a01-DO1',
    collectorDeviceId: 'envio-a01',
    pointCode: 'DO1',
    displayName: '储能充放电指示灯',
    direction: 'DO',
    originModelName: 'pcs_indicator_light',
    actionType: '亮灯提示',
    categoryOrPriority: '低',
    enabled: true,
    remark: 'PCS运行状态外显',
  },
  {
    id: 'envio-a01-DO2',
    collectorDeviceId: 'envio-a01',
    pointCode: 'DO2',
    displayName: '总进线开关消防脱口',
    direction: 'DO',
    originModelName: 'main_breaker_trip',
    actionType: '消防脱扣',
    categoryOrPriority: '高',
    enabled: true,
    remark: '消防最高优先级',
  },
  {
    id: 'envio-a01-DO3',
    collectorDeviceId: 'envio-a01',
    pointCode: 'DO3',
    displayName: '消防声光报警器',
    direction: 'DO',
    originModelName: 'alarm_horn_light',
    actionType: '声光告警',
    categoryOrPriority: '高',
    enabled: true,
    remark: '消防联动声光输出',
  },
  {
    id: 'envio-a01-DO4',
    collectorDeviceId: 'envio-a01',
    pointCode: 'DO4',
    displayName: 'PCS散热风扇控制',
    direction: 'DO',
    originModelName: 'pcs_fan_control',
    actionType: '散热联动',
    categoryOrPriority: '中',
    enabled: true,
    remark: '温升或大功率触发',
  },
  {
    id: 'envio-b01-DI1',
    collectorDeviceId: 'envio-b01',
    pointCode: 'DI1',
    displayName: '空调故障',
    direction: 'DI',
    originModelName: 'hvac_fault',
    triggerType: '0->1',
    categoryOrPriority: '公辅故障',
    enabled: true,
    remark: '公辅空调状态反馈',
  },
  {
    id: 'envio-b01-DI2',
    collectorDeviceId: 'envio-b01',
    pointCode: 'DI2',
    displayName: '温湿度超限',
    direction: 'DI',
    originModelName: 'temp_humidity_alarm',
    triggerType: '>50C',
    categoryOrPriority: '环境告警',
    enabled: true,
    remark: '高温保护联动',
  },
  {
    id: 'envio-b01-DO1',
    collectorDeviceId: 'envio-b01',
    pointCode: 'DO1',
    displayName: '空调启停继电器',
    direction: 'DO',
    originModelName: 'hvac_relay',
    actionType: '启停控制',
    categoryOrPriority: '中',
    enabled: false,
    remark: '预留联动空调启停',
  },
  {
    id: 'envio-b01-DO2',
    collectorDeviceId: 'envio-b01',
    pointCode: 'DO2',
    displayName: '补风风机',
    direction: 'DO',
    originModelName: 'ventilation_fan',
    actionType: '排风联动',
    categoryOrPriority: '中',
    enabled: false,
    remark: '预留联动排风',
  },
  {
    id: 'envio-c01-DI1',
    collectorDeviceId: 'envio-c01',
    pointCode: 'DI1',
    displayName: '预留',
    direction: 'DI',
    originModelName: 'reserved_di_1',
    triggerType: '0->1',
    categoryOrPriority: '预留',
    enabled: false,
    remark: '待现场确认',
  },
  {
    id: 'envio-c01-DO1',
    collectorDeviceId: 'envio-c01',
    pointCode: 'DO1',
    displayName: '预留',
    direction: 'DO',
    originModelName: 'reserved_do_1',
    actionType: '待配置',
    categoryOrPriority: '预留',
    enabled: false,
    remark: '待现场确认',
  },
  {
    id: 'envio-d01-DI1',
    collectorDeviceId: 'envio-d01',
    pointCode: 'DI1',
    displayName: '总进线故障',
    direction: 'DI',
    originModelName: 'main_line_fault',
    triggerType: '0->1',
    categoryOrPriority: '配电告警',
    enabled: true,
    remark: '配电房故障采集',
  },
  {
    id: 'envio-d01-DO1',
    collectorDeviceId: 'envio-d01',
    pointCode: 'DO1',
    displayName: '配电联动蜂鸣器',
    direction: 'DO',
    originModelName: 'power_room_buzzer',
    actionType: '告警提示',
    categoryOrPriority: '中',
    enabled: true,
    remark: '配电房联动输出',
  },
];

const fixedStrategyDevices = [
  { id: 'pcs-1', name: 'PCS', category: '变流器', group: '1#储能柜' },
  { id: 'bms-1', name: 'BMS', category: '电池管理系统', group: '1#储能柜' },
  { id: 'hvac-1', name: '空调', category: '温控设备', group: '公辅系统' },
  { id: 'power-room-1', name: '配电房', category: '配电单元', group: '站级配电' },
];

const priorityOptions = ['P1', 'P2', 'P3'];
const conditionRuleOptions = ['变位', '等于', '不等于', '大于', '大于等于', '小于', '小于等于'];
const transitionValueOptions = ['0→1', '1→0'];
const platformActionTypeOptions = ['触发告警', '无动作'];
const alarmLevelOptions = ['紧急', '重要', '一般'];

const collectorTelemetryPoints = [
  {
    pointCode: 'comm_status',
    pointLabel: '通讯状态',
    pointCategory: '状态点位',
    originModelName: 'communication_status',
    modes: ['condition'],
    valueType: 'enum',
    valueOptions: ['在线', '离线'],
  },
];

const devicePointCatalog = {
  'pcs-1': [
    {
      pointCode: 'run_status',
      pointLabel: 'PCS运行状态',
      pointCategory: '状态点位',
      originModelName: 'run_status',
      modes: ['condition'],
      valueType: 'enum',
      valueOptions: ['充电', '放电', '待机'],
    },
    {
      pointCode: 'fault_status',
      pointLabel: 'PCS故障',
      pointCategory: '故障点位',
      originModelName: 'fault_status',
      modes: ['condition'],
      valueType: 'enum',
      valueOptions: ['正常', '故障'],
    },
    {
      pointCode: 'active_power',
      pointLabel: 'PCS功率',
      pointCategory: '数据项点位',
      originModelName: 'active_power',
      modes: ['condition'],
      valueType: 'number',
    },
    {
      pointCode: 'cabinet_temp',
      pointLabel: 'PCS柜内温度',
      pointCategory: '数据项点位',
      originModelName: 'cabinet_temp',
      modes: ['condition'],
      valueType: 'number',
    },
    {
      pointCode: 'shutdown_cmd',
      pointLabel: 'PCS停机控制',
      pointCategory: '控制位',
      originModelName: 'shutdown_cmd',
      modes: ['action'],
      commands: ['关闭PCS', '仅关闭PCS', '恢复运行'],
    },
    {
      pointCode: 'charge_discharge_cmd',
      pointLabel: '充放电策略控制',
      pointCategory: '控制位',
      originModelName: 'charge_discharge_cmd',
      modes: ['action'],
      commands: ['停止充放电', '允许充放电'],
    },
  ],
  'bms-1': [
    {
      pointCode: 'alarm_level',
      pointLabel: 'BMS告警等级',
      pointCategory: '故障点位',
      originModelName: 'alarm_level',
      modes: ['condition'],
      valueType: 'enum',
      valueOptions: ['一级告警', '二级告警', '三级告警'],
    },
    {
      pointCode: 'fault_status',
      pointLabel: 'BMS故障',
      pointCategory: '故障点位',
      originModelName: 'fault_status',
      modes: ['condition'],
      valueType: 'enum',
      valueOptions: ['正常', '故障'],
    },
    {
      pointCode: 'soc',
      pointLabel: 'BMS-SOC',
      pointCategory: '数据项点位',
      originModelName: 'soc',
      modes: ['condition'],
      valueType: 'number',
    },
    {
      pointCode: 'charge_discharge_enable',
      pointLabel: '充放电使能',
      pointCategory: '控制位',
      originModelName: 'charge_discharge_enable',
      modes: ['action'],
      commands: ['停止充放电', '允许充放电'],
    },
  ],
  'hvac-1': [
    {
      pointCode: 'fault_status',
      pointLabel: '空调故障',
      pointCategory: '故障点位',
      originModelName: 'fault_status',
      modes: ['condition'],
      valueType: 'enum',
      valueOptions: ['正常', '故障'],
    },
    {
      pointCode: 'room_temp',
      pointLabel: '空调回风温度',
      pointCategory: '数据项点位',
      originModelName: 'room_temp',
      modes: ['condition'],
      valueType: 'number',
    },
    {
      pointCode: 'humidity',
      pointLabel: '机房湿度',
      pointCategory: '数据项点位',
      originModelName: 'humidity',
      modes: ['condition'],
      valueType: 'number',
    },
    {
      pointCode: 'hvac_enable',
      pointLabel: '空调启停控制',
      pointCategory: '控制位',
      originModelName: 'hvac_enable',
      modes: ['action'],
      commands: ['启动空调', '关闭空调'],
    },
    {
      pointCode: 'setpoint_adjust',
      pointLabel: '空调设定值调整',
      pointCategory: '控制位',
      originModelName: 'setpoint_adjust',
      modes: ['action'],
      commands: ['温度设定+1℃', '温度设定-1℃'],
    },
  ],
  'power-room-1': [
    {
      pointCode: 'main_line_fault',
      pointLabel: '总进线故障',
      pointCategory: '故障点位',
      originModelName: 'main_line_fault',
      modes: ['condition'],
      valueType: 'enum',
      valueOptions: ['正常', '故障'],
    },
    {
      pointCode: 'power_room_temp',
      pointLabel: '配电房温度',
      pointCategory: '数据项点位',
      originModelName: 'power_room_temp',
      modes: ['condition'],
      valueType: 'number',
    },
    {
      pointCode: 'buzzer_ctrl',
      pointLabel: '蜂鸣器控制',
      pointCategory: '控制位',
      originModelName: 'buzzer_ctrl',
      modes: ['action'],
      commands: ['启动蜂鸣器', '停止蜂鸣器'],
    },
  ],
};

const inferSignalCommands = (signalPoint) => {
  const name = `${signalPoint.displayName} ${signalPoint.originModelName}`.toLowerCase();
  if (name.includes('脱') || name.includes('breaker')) return ['脱扣', '复归'];
  if (name.includes('报警')) return ['动作', '停止'];
  if (name.includes('指示灯')) return ['亮起', '熄灭'];
  if (name.includes('风机') || name.includes('风扇')) return ['启动', '停止'];
  if (name.includes('空调')) return ['启动', '停止'];
  return ['动作', '复位'];
};

const getStrategyDevices = (collectorDevices) => [
  ...collectorDevices.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    group: item.group,
  })),
  ...fixedStrategyDevices,
];

const getDeviceName = (devices, deviceId) => devices.find((item) => item.id === deviceId)?.name || '未选择设备';

const createCondition = (deviceId) => ({
  id: `condition-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
  deviceId,
  pointCode: '',
  pointLabel: '',
  rule: '变位',
  value: '0→1',
});

const createDeviceAction = (deviceId, order = 1) => ({
  id: `action-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
  deviceId,
  pointCode: '',
  pointLabel: '',
  command: '',
  order,
});

const createPlatformAction = (type = '触发告警', order = 99) => ({
  type,
  alarmLevel: type === '触发告警' ? '重要' : '',
  order,
});

const normalizePlatformAction = (text, order = 99) => {
  if (!text || text === '\\') return createPlatformAction('无动作', order);
  if (text.includes('告警')) return createPlatformAction('触发告警', order);
  return createPlatformAction('无动作', order);
};

const getSignalPoint = (points, deviceId, pointCode) =>
  points.find((item) => item.collectorDeviceId === deviceId && item.pointCode === pointCode);

const resolveDeviceIdFromText = (text = '') => {
  if (text.includes('BMS')) return 'bms-1';
  if (text.includes('PCS')) return 'pcs-1';
  if (text.includes('空调')) return 'hvac-1';
  if (text.includes('配电')) return 'power-room-1';
  return 'pcs-1';
};

const mapLegacyRule = (operator) => {
  if (operator === '边沿') return '变位';
  if (operator === '=') return '等于';
  if (operator === '>') return '大于';
  if (operator === '>=') return '大于等于';
  if (operator === '<') return '小于';
  if (operator === '<=') return '小于等于';
  return '等于';
};

const getPointOptionsForDevice = (deviceId, mode, signalPoints) => {
  if (!deviceId) return [];

  const signalDerivedPoints = signalPoints
    .filter((item) => item.collectorDeviceId === deviceId)
    .filter((item) => (mode === 'action' ? item.direction === 'DO' : true))
    .map((item) => {
      const isTransition = item.direction === 'DI' && (item.triggerType || '').includes('->');
      return {
        pointCode: item.pointCode,
        pointLabel: item.displayName,
        pointCategory: item.direction === 'DI' ? 'DI点位' : 'DO点位',
        originModelName: item.originModelName,
        valueType: mode === 'condition' ? (isTransition ? 'transition' : 'enum') : 'enum',
        valueOptions: isTransition ? transitionValueOptions : ['0', '1'],
        commands: item.direction === 'DO' ? inferSignalCommands(item) : undefined,
      };
    });

  const extraCollectorPoints =
    deviceId.startsWith('envio-') && mode === 'condition' ? collectorTelemetryPoints : [];

  const extraDevicePoints = (devicePointCatalog[deviceId] || []).filter((item) => item.modes.includes(mode));

  const seen = new Set();
  return [...signalDerivedPoints, ...extraCollectorPoints, ...extraDevicePoints].filter((item) => {
    const key = `${item.pointCode}-${item.pointCategory}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const getPointOption = (deviceId, pointCode, mode, signalPoints) =>
  getPointOptionsForDevice(deviceId, mode, signalPoints).find((item) => item.pointCode === pointCode);

const getCommandOptionsForAction = (action, signalPoints) => {
  const point = getPointOption(action.deviceId, action.pointCode, 'action', signalPoints);
  return point?.commands || ['动作', '复位'];
};

const renumberDeviceActions = (actions) =>
  actions.map((action, index) => ({
    ...action,
    order: index + 1,
  }));

const normalizeStrategyActionOrders = (strategy) => {
  const deviceEntries = (strategy.deviceActions || []).map((action, index) => ({
    type: 'device',
    index,
    order: action.order ?? index + 1,
    payload: action,
  }));
  const platformEntry = {
    type: 'platform',
    index: 0,
    order: strategy.platformAction?.order ?? deviceEntries.length + 1,
  };

  const ordered = [...deviceEntries, platformEntry].sort((a, b) => a.order - b.order);
  const nextDeviceActions = [];
  let nextPlatformAction = { ...strategy.platformAction };

  ordered.forEach((entry, orderIndex) => {
    if (entry.type === 'device') {
      nextDeviceActions.push({
        ...entry.payload,
        order: orderIndex + 1,
      });
    } else {
      nextPlatformAction = {
        ...nextPlatformAction,
        order: orderIndex + 1,
      };
    }
  });

  return {
    ...strategy,
    deviceActions: nextDeviceActions,
    platformAction: nextPlatformAction,
  };
};

const getSortedActionEntries = (strategy) => {
  const deviceEntries = (strategy.deviceActions || []).map((item, index) => ({
    type: 'device',
    index,
    order: item.order ?? index + 1,
  }));
  const platformEntry = {
    type: 'platform',
    index: 0,
    order: strategy.platformAction?.order ?? strategy.deviceActions.length + 1,
  };

  return [...deviceEntries, platformEntry].sort((a, b) => a.order - b.order);
};

const reorderCombinedActions = (strategy, type, index, direction) => {
  const entries = getSortedActionEntries(strategy);
  const currentIndex = entries.findIndex((item) => item.type === type && item.index === index);
  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
  if (currentIndex < 0 || targetIndex < 0 || targetIndex >= entries.length) return strategy;

  const reordered = [...entries];
  [reordered[currentIndex], reordered[targetIndex]] = [reordered[targetIndex], reordered[currentIndex]];

  const nextDeviceActions = [...strategy.deviceActions];
  const nextPlatformAction = { ...strategy.platformAction };

  reordered.forEach((entry, orderIndex) => {
    if (entry.type === 'device') {
      nextDeviceActions[entry.index] = { ...nextDeviceActions[entry.index], order: orderIndex + 1 };
    } else {
      nextPlatformAction.order = orderIndex + 1;
    }
  });

  return normalizeStrategyActionOrders({
    ...strategy,
    deviceActions: [...nextDeviceActions].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    platformAction: nextPlatformAction,
  });
};

const legacyEnvStrategyList = [
  {
    id: 'ENV-RULE-001',
    name: '消防联动-水浸',
    code: 'ENV-RULE-001',
    enabled: true,
    logicMode: 'OR',
    conditions: [
      { sourceType: 'signal', collectorDeviceId: 'envio-a01', sourceCode: 'DI1', operator: '边沿', value: '0->1' },
    ],
    actions: [
      { targetType: 'do', collectorDeviceId: 'envio-a01', targetCode: 'DO2', command: '脱口' },
      { targetType: 'do', collectorDeviceId: 'envio-a01', targetCode: 'DO3', command: '动作' },
    ],
    platformAction: '界面显示并发送告警信息',
    priority: 'P1',
    remark: '该信号会自动复归，复归时声光告警消失，脱扣事件需要去现场手动复归',
  },
  {
    id: 'ENV-RULE-002',
    name: '消防联动-烟感',
    code: 'ENV-RULE-002',
    enabled: true,
    logicMode: 'OR',
    conditions: [
      { sourceType: 'signal', collectorDeviceId: 'envio-a01', sourceCode: 'DI2', operator: '边沿', value: '0->1' },
    ],
    actions: [
      { targetType: 'do', collectorDeviceId: 'envio-a01', targetCode: 'DO2', command: '脱口' },
      { targetType: 'do', collectorDeviceId: 'envio-a01', targetCode: 'DO3', command: '动作' },
    ],
    platformAction: '界面显示并发送告警信息',
    priority: 'P1',
    remark: '该信号会自动复归，复归时声光告警消失，脱扣事件需要去现场手动复归',
  },
  {
    id: 'ENV-RULE-003',
    name: '消防联动-灭火装置',
    code: 'ENV-RULE-003',
    enabled: true,
    logicMode: 'OR',
    conditions: [
      { sourceType: 'signal', collectorDeviceId: 'envio-a01', sourceCode: 'DI3', operator: '边沿', value: '0->1' },
    ],
    actions: [
      { targetType: 'do', collectorDeviceId: 'envio-a01', targetCode: 'DO2', command: '脱口' },
      { targetType: 'do', collectorDeviceId: 'envio-a01', targetCode: 'DO3', command: '动作' },
    ],
    platformAction: '界面显示并发送告警信息',
    priority: 'P1',
    remark: '该信号会自动复归，复归时声光告警消失，脱扣事件需要去现场手动复归',
  },
  {
    id: 'ENV-RULE-004',
    name: '设备保护-浪涌',
    code: 'ENV-RULE-004',
    enabled: true,
    logicMode: 'OR',
    conditions: [
      { sourceType: 'signal', collectorDeviceId: 'envio-a01', sourceCode: 'DI4', operator: '边沿', value: '0->1' },
    ],
    actions: [
      { targetType: 'do', collectorDeviceId: 'envio-a01', targetCode: 'DO3', command: '动作' },
    ],
    platformAction: '界面显示并发送告警信息',
    priority: 'P2',
    remark: '触发后进行事件记录与现场核查，告警恢复后可继续运行。',
  },
  {
    id: 'ENV-RULE-005',
    name: '安防监测-门禁开启',
    code: 'ENV-RULE-005',
    enabled: false,
    logicMode: 'AND',
    conditions: [
      { sourceType: 'signal', collectorDeviceId: 'envio-a01', sourceCode: 'DI5', operator: '=', value: '0' },
    ],
    actions: [],
    platformAction: '界面显示并发送告警信息',
    priority: 'P3',
    remark: '仅做门禁状态显示和事件追溯，不触发外部 DO 联动。',
  },
  {
    id: 'ENV-RULE-006',
    name: '消防联动-可燃气体',
    code: 'ENV-RULE-006',
    enabled: true,
    logicMode: 'OR',
    conditions: [
      { sourceType: 'signal', collectorDeviceId: 'envio-a01', sourceCode: 'DI6', operator: '边沿', value: '0->1' },
    ],
    actions: [
      { targetType: 'do', collectorDeviceId: 'envio-a01', targetCode: 'DO2', command: '脱口' },
      { targetType: 'do', collectorDeviceId: 'envio-a01', targetCode: 'DO3', command: '动作' },
    ],
    platformAction: '界面显示并发送告警信息',
    priority: 'P1',
    remark: '该信号会自动复归，复归时声光告警消失，脱扣事件需要去现场手动复归',
  },
  {
    id: 'ENV-RULE-007',
    name: '紧急停机-急停按钮',
    code: 'ENV-RULE-007',
    enabled: true,
    logicMode: 'OR',
    conditions: [
      { sourceType: 'signal', collectorDeviceId: 'envio-a01', sourceCode: 'DI7', operator: '边沿', value: '1->0' },
    ],
    actions: [
      { targetType: 'do', collectorDeviceId: 'envio-a01', targetCode: 'DO2', command: '脱扣' },
      { targetType: 'do', collectorDeviceId: 'envio-a01', targetCode: 'DO3', command: '动作' },
    ],
    platformAction: '界面显示并发送告警信息',
    priority: 'P1',
    remark: '该信号会自动复归，复归时声光告警消失，脱扣事件需要去现场手动复归',
  },
  {
    id: 'ENV-RULE-008',
    name: '设备状态-BMS三级告警',
    code: 'ENV-RULE-008',
    enabled: true,
    logicMode: 'OR',
    conditions: [
      { sourceType: 'deviceStatus', sourceCode: 'RS485-1/BMS', operator: '=', value: '三级告警' },
    ],
    actions: [
      { targetType: 'emsControl', targetCode: 'PCS', command: '关闭PCS，并关闭策略' },
    ],
    platformAction: '界面显示PCS状态',
    priority: 'P1',
    remark: 'BMS 严重告警优先级高于常规运行策略，触发后立即停机。',
  },
  {
    id: 'ENV-RULE-009',
    name: '环境保护-温湿度超限',
    code: 'ENV-RULE-009',
    enabled: true,
    logicMode: 'AND',
    conditions: [
      { sourceType: 'signal', collectorDeviceId: 'envio-b01', sourceCode: 'DI2', operator: '=', value: '超限' },
      { sourceType: 'deviceStatus', sourceCode: 'PCS', operator: '=', value: '运行中' },
    ],
    actions: [
      { targetType: 'emsControl', targetCode: 'PCS', command: '仅关闭PCS' },
      { targetType: 'emsControl', targetCode: 'BMS', command: '停止充放电' },
    ],
    platformAction: '界面显示PCS状态 / 界面显示BMS状态',
    priority: 'P2',
    remark: '仅关闭设备，不关闭策略，条件消失后继续执行策略',
  },
  {
    id: 'ENV-RULE-010',
    name: '运行联动-PCS运行状态',
    code: 'ENV-RULE-010',
    enabled: true,
    logicMode: 'AND',
    conditions: [
      { sourceType: 'deviceStatus', sourceCode: 'PCS', operator: 'in', value: '充电,放电' },
      { sourceType: 'deviceStatus', sourceCode: 'PCS功率', operator: '>', value: '20kW' },
    ],
    actions: [
      { targetType: 'do', collectorDeviceId: 'envio-a01', targetCode: 'DO1', command: '亮起' },
      { targetType: 'do', collectorDeviceId: 'envio-a01', targetCode: 'DO4', command: '散热风扇动作' },
    ],
    platformAction: '\\',
    priority: 'P3',
    remark: '触发条件不满足时，熄灭指示灯，关闭散热风扇',
  },
];

const initialEnvStrategyList = legacyEnvStrategyList.map((item) => {
  const conditions = item.conditions.map((condition, index) => {
    if (condition.sourceType === 'signal') {
      const point = getSignalPoint(initialSignalPoints, condition.collectorDeviceId, condition.sourceCode);
      return {
        id: `${item.id}-condition-${index}`,
        deviceId: condition.collectorDeviceId,
        pointCode: condition.sourceCode,
        pointLabel: point?.displayName || condition.sourceCode,
        rule: mapLegacyRule(condition.operator),
        value: (condition.value || '').replaceAll('->', '→'),
      };
    }

    const deviceId = resolveDeviceIdFromText(condition.sourceCode);
    return {
      id: `${item.id}-condition-${index}`,
      deviceId,
      pointCode: condition.sourceCode,
      pointLabel: condition.sourceCode,
      rule: mapLegacyRule(condition.operator),
      value: (condition.value || '').replaceAll('->', '→'),
    };
  });

  const deviceActions = item.actions.map((action, index) => {
    if (action.targetType === 'do') {
      const point = getSignalPoint(initialSignalPoints, action.collectorDeviceId, action.targetCode);
      return {
        id: `${item.id}-action-${index}`,
        deviceId: action.collectorDeviceId,
        pointCode: action.targetCode,
        pointLabel: point?.displayName || action.targetCode,
        command: action.command,
        order: index + 1,
      };
    }

    return {
      id: `${item.id}-action-${index}`,
      deviceId: resolveDeviceIdFromText(action.targetCode),
      pointCode: action.targetCode,
      pointLabel: action.targetCode,
      command: action.command,
      order: index + 1,
    };
  });

  return {
    id: item.id,
    name: item.name,
    code: item.code,
    enabled: item.enabled,
    logicMode: item.logicMode,
    priority: item.priority,
    remark: item.remark,
    conditions,
    deviceActions: renumberDeviceActions(deviceActions),
    platformAction: normalizePlatformAction(item.platformAction, deviceActions.length + 1),
  };
});

const createStrategy = (deviceId = initialCollectorDevices[0].id) => ({
  id: `ENV-RULE-${Date.now()}`,
  name: '新建动环策略',
  code: `ENV-RULE-${String(Date.now()).slice(-6)}`,
  enabled: true,
  logicMode: 'AND',
  priority: 'P2',
  remark: '请补充策略说明',
  conditions: [createCondition(deviceId)],
  deviceActions: [createDeviceAction(deviceId, 1)],
  platformAction: createPlatformAction('触发告警', 2),
});

const initialAntiBackflowConfig = {
  enabled: true,
  status: '运行中',
  limitValue: '0',
  targetValue: '0',
  protectionLevel: '降低储能放电功率，直到静置',
  targetPower: '0',
  warningThreshold: '3',
  recoveryThreshold: '1',
  deadband: '2',
  confirmTime: '1',
  actionChain: '强制储能充电 -> 降低储能放电 -> 限制光伏逆变器 -> 触发告警',
  lastActionAt: '今日 14:32:16',
  latestAction: '限制光伏逆变器 20kW',
  currentPower: '-1.6 kW',
  summaryTarget: '并网点功率维持在 0 kW 附近',
  priority: '储能优先，光伏次级',
  recoveryRule: '连续 1s 回到恢复阈值内后自动退出',
};

const initialDemandControlConfig = {
  enabled: true,
  status: '运行中',
  limitValue: '1000',
  targetValue: '995',
  protectionLevel: '降低储能充电功率，必要时可以放电',
  declaredLimit: '1000',
  warningThreshold: '950',
  recoveryThreshold: '900',
  deadband: '20',
  demandWindow: '15分钟',
  controlStrategy: '提前抑制',
  actionChain: '储能放电提升 -> 有序充电降功率 -> 暂停新充电会话 -> 触发告警',
  chargerControlEnabled: true,
  chargerControlMode: '按优先级降功率',
  chargerMaxPower: '200',
  chargerMinPower: '20',
  chargerRecoveryDelay: '5分钟',
  lastActionAt: '今日 13:48:05',
  latestAction: '储能放电提升至 120kW',
  currentDemand: '912 kW',
  peakDemand: '948 kW',
  margin: '88 kW',
  executionLevel: '一级预控',
};

const initialGridSwitchConfig = {
  mode: 'grid',
  topology: 'without_sts',
  switchStatus: '并网稳定运行',
  lastSwitchAt: '今日 09:18:32',
  soc: '68%',
  gridStatus: '电网正常',
  pcsStatus: 'PQ并网',
  qf1Status: '合闸',
  qf2Status: '合闸',
  stsStatus: '未配置',
};

const initialStorageBoundaryConfig = {
  socMin: '20',
  socMax: '90',
  chargePowerMin: '0',
  chargePowerMax: '100',
  dischargePowerMin: '0',
  dischargePowerMax: '100',
  reserveSoc: '10',
  nominalCapacityKwh: 500,
};

const peakTariffBands = [
  { label: '谷', start: '00:00', end: '07:00', color: 'rgba(16,185,129,0.16)' },
  { label: '平', start: '07:00', end: '10:00', color: 'rgba(59,130,246,0.14)' },
  { label: '峰', start: '10:00', end: '12:00', color: 'rgba(245,158,11,0.16)' },
  { label: '平', start: '12:00', end: '17:00', color: 'rgba(59,130,246,0.14)' },
  { label: '峰', start: '17:00', end: '21:00', color: 'rgba(245,158,11,0.16)' },
  { label: '谷', start: '21:00', end: '24:00', color: 'rgba(16,185,129,0.16)' },
];

const tariffLevelOptions = [
  { value: '尖', color: 'rgba(239,68,68,0.28)', badge: 'text-red-300 bg-red-500/10 border-red-500/30' },
  { value: '峰', color: 'rgba(245,158,11,0.25)', badge: 'text-amber-300 bg-amber-500/10 border-amber-500/30' },
  { value: '平', color: 'rgba(59,130,246,0.20)', badge: 'text-blue-300 bg-blue-500/10 border-blue-500/30' },
  { value: '谷', color: 'rgba(16,185,129,0.20)', badge: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30' },
  { value: '深谷', color: 'rgba(6,182,212,0.18)', badge: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/30' },
];

const getTariffLevelMeta = (level) =>
  tariffLevelOptions.find((item) => item.value === level) || tariffLevelOptions[2];

const createTariffPeriod = (start = '00:00', end = '01:00', level = '平', price = '0.6800') => ({
  id: `tariff-period-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
  start,
  end,
  level,
  price,
});

const initialFixedTariffTemplates = [
  {
    id: 'fixed-summer-industrial',
    name: '夏季工商业尖峰电价',
    scopeType: 'monthly',
    periods: [
      createTariffPeriod('00:00', '07:00', '深谷', '0.2800'),
      createTariffPeriod('07:00', '10:00', '平', '0.6800'),
      createTariffPeriod('10:00', '12:00', '峰', '1.1500'),
      createTariffPeriod('12:00', '15:00', '尖', '1.4500'),
      createTariffPeriod('15:00', '21:00', '峰', '1.1500'),
      createTariffPeriod('21:00', '24:00', '谷', '0.3200'),
    ],
  },
  {
    id: 'fixed-holiday',
    name: '周日及法定节假日电价',
    scopeType: 'daily',
    periods: [
      createTariffPeriod('00:00', '08:00', '深谷', '0.2600'),
      createTariffPeriod('08:00', '18:00', '平', '0.6200'),
      createTariffPeriod('18:00', '22:00', '峰', '1.0500'),
      createTariffPeriod('22:00', '24:00', '谷', '0.3200'),
    ],
  },
];

const parseDateParts = (dateString = '2026-04-16') => {
  const [year, month, day] = String(dateString).split('-').map(Number);
  return {
    year: year || 2026,
    month: month || 1,
    day: day || 1,
  };
};

const formatDateString = (year, month, day) =>
  `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

const getDynamicTariffStoreKey = (dateString, granularity) => `${dateString}::${granularity}`;

const getAveragePriceFromRows = (rows = []) => {
  const numeric = rows.map((row) => Number(row.price)).filter((price) => !Number.isNaN(price));
  return numeric.reduce((sum, price) => sum + price, 0) / Math.max(numeric.length, 1);
};

const createDynamicTariffMeta = (granularity, overrides = {}) => ({
  fileName: '本地演示数据',
  importedAt: '今日 08:15:22',
  source: `${granularity === '96' ? '96点/15分钟' : '48点/30分钟'}初始化`,
  saved: true,
  ...overrides,
});

const generateDynamicTariffRows = (granularity = '96', dateString = '2026-04-16') => {
  const count = Number(granularity);
  const step = (24 * 60) / count;
  const { year, month, day } = parseDateParts(dateString);
  const dateBias = (((year % 100) * 3 + month * 5 + day * 7) % 11 - 5) * 0.006;
  const rows = Array.from({ length: count }, (_, index) => {
    const startMinutes = index * step;
    const endMinutes = (index + 1) * step;
    const hour = startMinutes / 60;
    const base =
      hour < 6 ? 0.18 :
      hour < 10 ? 0.58 :
      hour < 12 ? 0.96 :
      hour < 15 ? 1.18 :
      hour < 18 ? 0.64 :
      hour < 22 ? 1.08 :
      0.32;
    const offset =
      hour < 6 ? (index % 2 === 0 ? 0.0 : 0.008) :
      hour < 10 ? (index % 3) * 0.012 :
      hour < 12 ? (index % 2) * 0.018 :
      hour < 15 ? (index % 4) * 0.01 :
      hour < 18 ? (index % 2) * 0.016 :
      hour < 22 ? (index % 3) * 0.014 :
      (index % 2) * 0.01;
    return {
      id: `dyn-${granularity}-${index}`,
      start: formatMinutesToTime(startMinutes),
      end: formatMinutesToTime(endMinutes),
      price: (base + offset + dateBias).toFixed(4),
    };
  });
  return rows;
};

const buildIntervalStepPolyline = (rows, getY) => {
  if (!rows || rows.length === 0) return '';
  const points = [];
  rows.forEach((row, index) => {
    const start = parseTimeToMinutes(row.start);
    const end = parseTimeToMinutes(row.end);
    const value = Number(row.price);
    const safeY = Number.isNaN(value) ? getY(0) : getY(value);
    const startX = (start / 1440) * 100;
    const endX = (end / 1440) * 100;
    if (index === 0) {
      points.push(`${startX},${safeY}`);
    }
    points.push(`${endX},${safeY}`);
    const next = rows[index + 1];
    if (next) {
      const nextY = Number.isNaN(Number(next.price)) ? getY(0) : getY(Number(next.price));
      points.push(`${endX},${nextY}`);
    }
  });
  return points.join(' ');
};

const buildIntervalLinePolyline = (rows, getY) => {
  if (!rows || rows.length === 0) return '';
  return rows
    .map((row) => {
      const start = parseTimeToMinutes(row.start);
      const end = parseTimeToMinutes(row.end);
      const midpoint = start + ((end - start) / 2);
      const value = Number(row.price);
      const safeY = Number.isNaN(value) ? getY(0) : getY(value);
      const x = (midpoint / 1440) * 100;
      return `${x},${safeY}`;
    })
    .join(' ');
};

const parseImportedTariffRows = (matrix, granularity) => {
  const count = Number(granularity);
  const step = (24 * 60) / count;
  const dataRows = matrix.filter((row) => Array.isArray(row) && row.some((cell) => String(cell ?? '').trim() !== ''));
  const rowsWithoutHeader = dataRows.filter((row, index) => {
    if (index > 0) return true;
    return !row.some((cell) => /开始|结束|电价|price|start|end/i.test(String(cell ?? '')));
  });

  return rowsWithoutHeader.map((row, index) => {
    const cells = row.map((cell) => String(cell ?? '').trim());
    const timeIndexes = cells
      .map((cell, cellIndex) => (/^\d{1,2}:\d{2}$/.test(cell) || cell === '24:00' ? cellIndex : -1))
      .filter((cellIndex) => cellIndex >= 0);
    const numericIndexes = cells
      .map((cell, cellIndex) => (cell !== '' && !Number.isNaN(Number(cell)) ? cellIndex : -1))
      .filter((cellIndex) => cellIndex >= 0);
    const start = timeIndexes.length >= 2 ? cells[timeIndexes[0]] : formatMinutesToTime(index * step);
    const end = timeIndexes.length >= 2 ? cells[timeIndexes[1]] : formatMinutesToTime((index + 1) * step);
    const priceIndex = numericIndexes[numericIndexes.length - 1];
    const price = priceIndex !== undefined ? Number(cells[priceIndex]) : NaN;
    return {
      id: `import-${Date.now()}-${index}`,
      start,
      end,
      price: Number.isNaN(price) ? '' : price.toFixed(4),
    };
  });
};

const validateTimePeriods = (periods, { requireFullDay = false } = {}) => {
  const normalized = periods
    .map((period) => ({
      ...period,
      startMinutes: parseTimeToMinutes(period.start),
      endMinutes: parseTimeToMinutes(period.end),
      priceValue: Number(period.price),
    }))
    .sort((a, b) => a.startMinutes - b.startMinutes);

  for (const period of normalized) {
    if (!period.start || !period.end) return '开始时间和结束时间不能为空。';
    if (period.endMinutes <= period.startMinutes) return '每条时段必须满足开始时间小于结束时间。';
    if (period.price === '' || Number.isNaN(period.priceValue)) return '电价必须为数值。';
  }

  for (let index = 1; index < normalized.length; index += 1) {
    if (normalized[index].startMinutes < normalized[index - 1].endMinutes) {
      return '同一模板内时段不可重叠。';
    }
  }

  if (requireFullDay) {
    if (normalized[0]?.startMinutes !== 0 || normalized[normalized.length - 1]?.endMinutes !== 1440) {
      return '动态电价必须覆盖 00:00-24:00。';
    }
    for (let index = 1; index < normalized.length; index += 1) {
      if (normalized[index].startMinutes !== normalized[index - 1].endMinutes) {
        return '动态电价时段必须连续且不重叠。';
      }
    }
  }

  return '';
};

const createPeakPeriod = (start = '00:00', end = '01:00', power = 50) => ({
  id: `period-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
  start,
  end,
  power: String(power),
  action: Number(power) >= 0 ? 'charge' : 'discharge',
});

const clonePeakTemplate = (template) => ({
  ...template,
  periods: template.periods.map((period) => ({
    ...period,
    id: `period-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
  })),
});

const peakShavingTemplateMap = {
  aggressive: [
    createPeakPeriod('00:00', '07:00', 80),
    createPeakPeriod('10:00', '12:00', -90),
    createPeakPeriod('12:00', '14:00', 45),
    createPeakPeriod('17:00', '21:00', -100),
  ],
  balanced: [
    createPeakPeriod('00:00', '06:00', 60),
    createPeakPeriod('11:00', '13:00', 35),
    createPeakPeriod('18:00', '21:00', -70),
  ],
  conservative: [
    createPeakPeriod('00:00', '05:00', 45),
    createPeakPeriod('19:00', '21:00', -55),
  ],
};

const initialPeakTemplates = [
  {
    id: 'tpl-aggressive',
    name: '夏季激进两充两放',
    periods: clonePeakTemplate({ periods: peakShavingTemplateMap.aggressive }).periods,
  },
  {
    id: 'tpl-balanced',
    name: '冬季平稳一充一放',
    periods: clonePeakTemplate({ periods: peakShavingTemplateMap.balanced }).periods,
  },
  {
    id: 'tpl-conservative',
    name: '保守单充单放',
    periods: clonePeakTemplate({ periods: peakShavingTemplateMap.conservative }).periods,
  },
];

const initialMonthTemplateMap = {
  1: 'tpl-balanced',
  2: 'tpl-balanced',
  3: 'tpl-balanced',
  4: 'tpl-balanced',
  5: 'tpl-balanced',
  6: 'tpl-aggressive',
  7: 'tpl-aggressive',
  8: 'tpl-aggressive',
  9: 'tpl-aggressive',
  10: 'tpl-balanced',
  11: 'tpl-balanced',
  12: 'tpl-balanced',
};

const initialDayTemplateOverrides = {
  '07-05': 'tpl-conservative',
  '07-15': 'tpl-aggressive',
  '07-18': 'tpl-balanced',
};

const formatMonthDay = (month, day) =>
  `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

const getDaysInMonth = (month, year = 2026) => new Date(year, month, 0).getDate();

const weekDayLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

const holidayMap = {
  '01-01': '元旦',
  '02-17': '春节',
  '02-18': '春节',
  '02-19': '春节',
  '04-05': '清明',
  '05-01': '劳动节',
  '06-19': '端午',
  '09-25': '中秋',
  '10-01': '国庆',
  '10-02': '国庆',
  '10-03': '国庆',
};

const getHolidayLabel = (month, day) => holidayMap[formatMonthDay(month, day)] || '';

const getCalendarCells = (month, year = 2026) => {
  const totalDays = getDaysInMonth(month, year);
  const firstDay = new Date(year, month - 1, 1).getDay();
  const mondayOffset = (firstDay + 6) % 7;
  const leadingEmptyCells = Array.from({ length: mondayOffset }, (_, index) => ({
    id: `empty-leading-${month}-${index}`,
    type: 'empty',
  }));
  const dayCells = Array.from({ length: totalDays }, (_, index) => ({
    id: `day-${month}-${index + 1}`,
    type: 'day',
    day: index + 1,
  }));
  const remainder = (leadingEmptyCells.length + dayCells.length) % 7;
  const trailingEmptyCells = Array.from({ length: remainder === 0 ? 0 : 7 - remainder }, (_, index) => ({
    id: `empty-trailing-${month}-${index}`,
    type: 'empty',
  }));
  return [...leadingEmptyCells, ...dayCells, ...trailingEmptyCells];
};

const parseTimeToMinutes = (time) => {
  const [hour, minute] = String(time || '00:00').split(':').map(Number);
  return (hour || 0) * 60 + (minute || 0);
};

const formatMinutesToTime = (minutes) => {
  const normalized = Math.max(0, Math.min(minutes, 24 * 60));
  const hour = Math.floor(normalized / 60);
  const minute = normalized % 60;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

const addDaysToDateString = (dateString, offset) => {
  const [year, month, day] = String(dateString).split('-').map(Number);
  const date = new Date(year, month - 1, day + offset);
  return formatDateString(date.getFullYear(), date.getMonth() + 1, date.getDate());
};

const getTodayDateString = () => {
  const date = new Date();
  return formatDateString(date.getFullYear(), date.getMonth() + 1, date.getDate());
};

const gridSwitchTopologyOptions = [
  { id: 'without_sts', label: '不含静态转换开关 STS', shortLabel: '无 STS' },
  { id: 'with_sts', label: '含静态转换开关 STS', shortLabel: '含 STS' },
];

const getGridSwitchSteps = (topology, targetMode) => {
  if (topology === 'with_sts') {
    return targetMode === 'island'
      ? ['STS接收离网指令', 'STS快速切离电网', 'PCS进入VF支撑', 'EMS启用SOC保护']
      : ['STS同期检查', 'STS恢复并网通道', 'PCS切回PQ模式', 'EMS恢复经济策略'];
  }

  return targetMode === 'island'
    ? ['QF1分闸', 'PCS关机', 'PCS切换VF模式', 'PCS开机孤网供电']
    : ['PCS关机', 'QF1合闸', 'PCS切换PQ模式', 'PCS开机并网'];
};

const getGridSwitchModeMeta = (mode) =>
  mode === 'island'
    ? { label: '离网运行', tone: 'amber', actionLabel: '恢复并网', target: 'grid' }
    : { label: '并网运行', tone: 'green', actionLabel: '切换至离网', target: 'island' };

const initialPlanCurveResourceConfig = [
  { id: 'pcs-1', name: '储能 PCS-1', type: '储能', color: '#00DFA2', enabled: true, ratio: '46', priority: 'P1', maxPower: '160', trackingMode: '保留备用容量' },
  { id: 'pv-1', name: '光伏逆变器-1', type: '光伏', color: '#FBBF24', enabled: true, ratio: '-32', priority: 'P2', maxPower: '180', trackingMode: '经济性优先' },
  { id: 'charger-1', name: '有序充电桩群', type: '有序充电', color: '#60A5FA', enabled: true, ratio: '22', priority: 'P3', maxPower: '120', trackingMode: '舒适/服务优先' },
  { id: 'load-1', name: '可控负荷', type: '负荷', color: '#C084FC', enabled: true, ratio: '14', priority: 'P4', maxPower: '80', trackingMode: '优先跟踪计划' },
];

const generatePlanCurveDemo = (
  source = 'user',
  resourceConfig = initialPlanCurveResourceConfig,
  targetAdjustments = { offset: '0', multiplier: '1', tolerance: '10' }
) => {
  const count = 96;
  const deviceProfiles = resourceConfig;
  const offset = Number(targetAdjustments.offset) || 0;
  const multiplier = Number(targetAdjustments.multiplier) || 1;
  const toleranceRatio = Math.max(Number(targetAdjustments.tolerance) || 10, 1) / 100;

  const rows = Array.from({ length: count }, (_, index) => {
    const minutes = index * 15;
    const hour = minutes / 60;
    const vppBias = source === 'vpp' ? 24 : 0;
    const morning = hour >= 8 && hour < 11 ? 42 + vppBias : 0;
    const noon = hour >= 11 && hour < 15 ? -70 - (source === 'vpp' ? 18 : 0) : 0;
    const evening = hour >= 18 && hour < 21 ? 95 + vppBias : 0;
    const night = hour >= 22 || hour < 6 ? -24 : 0;
    const vppTarget = morning + noon + evening + night + Math.sin(index / 5) * 8;
    const plan = vppTarget * multiplier + offset;
    const actual = plan + Math.sin(index / 3) * 9 + (index % 13 === 0 ? 18 : 0);
    const tolerance = Math.max(Math.abs(plan) * toleranceRatio, 20);
    const deviation = actual - plan;
    return {
      id: `plan-row-${source}-${index}`,
      time: minutes,
      label: formatMinutesToTime(minutes),
      vppTarget: Number(vppTarget.toFixed(1)),
      plan: Number(plan.toFixed(1)),
      actual: Number(actual.toFixed(1)),
      upper: Number((plan + tolerance).toFixed(1)),
      lower: Number((plan - tolerance).toFixed(1)),
      deviation: Number(deviation.toFixed(1)),
      outOfRange: Math.abs(deviation) > tolerance,
    };
  });

  const latestIndex = 58;
  const devices = deviceProfiles.map((device, deviceIndex) => {
    const share = device.enabled ? (Number(device.ratio) || 0) / 100 : 0;
    const maxPower = Math.max(Number(device.maxPower) || 0, 1);
    const rowsForDevice = rows.map((row, index) => {
      const rawPlan = row.plan * share + Math.sin(index / (deviceIndex + 3)) * 5;
      const plan = Math.max(-maxPower, Math.min(maxPower, rawPlan));
      const actual = plan + Math.cos(index / (deviceIndex + 4)) * 6;
      return {
        time: row.time,
        plan: Number(plan.toFixed(1)),
        actual: Number(actual.toFixed(1)),
      };
    });
    const latest = rowsForDevice[latestIndex];
    const deviation = latest.actual - latest.plan;
    const tolerance = Math.max(Math.abs(latest.plan) * 0.1, 20);
    return {
      ...device,
      rows: rowsForDevice,
      planPower: latest.plan,
      actualPower: latest.actual,
      deviation: Number(deviation.toFixed(1)),
      executionRate: `${Math.max(82, Math.min(100, 100 - Math.abs(deviation) / Math.max(Math.abs(latest.plan), 1) * 100)).toFixed(1)}%`,
      status: Math.abs(deviation) > tolerance ? '偏差告警' : '跟踪正常',
      enabled: device.enabled,
      priority: device.priority,
      maxPower: device.maxPower,
      trackingMode: device.trackingMode,
    };
  });

  return {
    source,
    rows,
    devices,
    summary: {
      planPower: rows[latestIndex].plan,
      vppTargetPower: rows[latestIndex].vppTarget,
      actualPower: rows[latestIndex].actual,
      deviation: rows[latestIndex].deviation,
      outOfRangeCount: rows.filter((row) => row.outOfRange).length,
      dispatchNo: source === 'vpp' ? 'VPP-20260428-04' : 'USER-PLAN-0428',
    },
  };
};

const normalizePeakPowerByAction = (action, power) => {
  const absolute = Math.max(Math.abs(Number(power) || 0), 1);
  return action === 'charge' ? absolute : -absolute;
};

const getStorageBoundaryNumbers = (config = initialStorageBoundaryConfig) => ({
  socMin: Number(config.socMin) || 0,
  socMax: Number(config.socMax) || 100,
  chargePowerMin: Number(config.chargePowerMin) || 0,
  chargePowerMax: Number(config.chargePowerMax) || 0,
  dischargePowerMin: Number(config.dischargePowerMin) || 0,
  dischargePowerMax: Number(config.dischargePowerMax) || 0,
  reserveSoc: Number(config.reserveSoc) || 0,
  nominalCapacityKwh: Number(config.nominalCapacityKwh) || 500,
});

const validateStorageBoundaryConfig = (config) => {
  const boundary = getStorageBoundaryNumbers(config);
  const fields = ['socMin', 'socMax', 'chargePowerMin', 'chargePowerMax', 'dischargePowerMin', 'dischargePowerMax', 'reserveSoc'];
  if (fields.some((field) => config[field] === '' || Number.isNaN(Number(config[field])))) {
    return '所有储能边界字段都必须填写数值。';
  }
  if (boundary.socMin < 0 || boundary.socMax > 100 || boundary.reserveSoc < 0 || boundary.reserveSoc > 100) {
    return 'SOC 和备用 SOC 必须在 0-100% 范围内。';
  }
  if (boundary.socMin >= boundary.socMax) return 'SOC运行下限必须小于SOC运行上限。';
  if (boundary.reserveSoc > boundary.socMin) return '备用SOC不能高于SOC运行下限。';
  if (boundary.chargePowerMin > boundary.chargePowerMax) return '充电功率下限不能高于充电功率上限。';
  if (boundary.dischargePowerMin > boundary.dischargePowerMax) return '放电功率下限不能高于放电功率上限。';
  if (boundary.chargePowerMin < 0 || boundary.dischargePowerMin < 0) return '功率下限不能小于 0。';
  return '';
};

const constrainPowerByStorageBoundary = (action, power, config = initialStorageBoundaryConfig) => {
  const boundary = getStorageBoundaryNumbers(config);
  const raw = Math.abs(Number(power) || 0);
  if (raw === 0) return 0;
  if (action === 'charge') {
    return Math.min(Math.max(raw, boundary.chargePowerMin), boundary.chargePowerMax);
  }
  return -Math.min(Math.max(raw, boundary.dischargePowerMin), boundary.dischargePowerMax);
};

const getPeakTemplateStats = (template) => {
  const periods = template?.periods || [];
  return {
    total: periods.length,
    charge: periods.filter((item) => Number(item.power) > 0).length,
    discharge: periods.filter((item) => Number(item.power) < 0).length,
  };
};

const buildPeakChartPoints = (periods) => {
  const steps = [0];
  const normalized = [...(periods || [])]
    .map((period) => ({
      ...period,
      startMinutes: parseTimeToMinutes(period.start),
      endMinutes: parseTimeToMinutes(period.end),
      powerValue: Number(period.power),
    }))
    .filter((period) => period.endMinutes > period.startMinutes)
    .sort((a, b) => a.startMinutes - b.startMinutes);

  normalized.forEach((period) => {
    steps.push({ time: period.startMinutes, power: steps[steps.length - 1]?.power ?? 0 });
    steps.push({ time: period.startMinutes, power: period.powerValue });
    steps.push({ time: period.endMinutes, power: period.powerValue });
    steps.push({ time: period.endMinutes, power: 0 });
  });

  const sanitized = steps
    .flatMap((item) => (typeof item === 'number' ? [{ time: 0, power: 0 }] : [item]))
    .concat([{ time: 24 * 60, power: 0 }])
    .sort((a, b) => a.time - b.time);

  const compact = [];
  sanitized.forEach((point) => {
    const last = compact[compact.length - 1];
    if (!last || last.time !== point.time || last.power !== point.power) {
      compact.push(point);
    }
  });
  return compact;
};

const summarizePeakTemplate = (template) => {
  const periods = template?.periods || [];
  const chargeMinutes = periods
    .filter((item) => Number(item.power) > 0)
    .reduce((sum, item) => sum + Math.max(0, parseTimeToMinutes(item.end) - parseTimeToMinutes(item.start)), 0);
  const dischargeMinutes = periods
    .filter((item) => Number(item.power) < 0)
    .reduce((sum, item) => sum + Math.max(0, parseTimeToMinutes(item.end) - parseTimeToMinutes(item.start)), 0);

  return {
    chargeHours: (chargeMinutes / 60).toFixed(1),
    dischargeHours: (dischargeMinutes / 60).toFixed(1),
  };
};

const getTariffBandForTime = (time) => {
  const minutes = parseTimeToMinutes(time);
  return peakTariffBands.find((band) => {
    const start = parseTimeToMinutes(band.start);
    const end = parseTimeToMinutes(band.end);
    return minutes >= start && minutes < end;
  }) || peakTariffBands[peakTariffBands.length - 1];
};

const buildSmartPlanPeriodsFromRows = (rows = [], storageBoundaryConfig = initialStorageBoundaryConfig) => {
  const normalizedRows = rows
    .map((row) => ({
      start: row.start,
      end: row.end,
      price: Number(row.price) || 0,
    }))
    .filter((row) => row.start && row.end);

  if (normalizedRows.length === 0) {
    return [
      createPeakPeriod('00:00', '06:00', constrainPowerByStorageBoundary('charge', 60, storageBoundaryConfig)),
      createPeakPeriod('18:00', '21:00', constrainPowerByStorageBoundary('discharge', 80, storageBoundaryConfig)),
    ].map((period) => ({
      ...period,
      tariffBand: getTariffBandForTime(period.start),
    }));
  }

  const sortedPrices = [...normalizedRows].map((row) => row.price).sort((a, b) => a - b);
  const lowThreshold = sortedPrices[Math.max(0, Math.floor(sortedPrices.length * 0.25) - 1)] ?? sortedPrices[0];
  const highThreshold = sortedPrices[Math.min(sortedPrices.length - 1, Math.floor(sortedPrices.length * 0.75))] ?? sortedPrices[sortedPrices.length - 1];
  const taggedRows = normalizedRows.map((row) => ({
    ...row,
    action:
      row.price <= lowThreshold ? 'charge' :
      row.price >= highThreshold ? 'discharge' :
      'idle',
  }));

  const merged = [];
  taggedRows.forEach((row) => {
    const last = merged[merged.length - 1];
    if (row.action === 'idle') return;
    if (last && last.action === row.action && last.end === row.start) {
      last.end = row.end;
      last.prices.push(row.price);
      return;
    }
    merged.push({
      action: row.action,
      start: row.start,
      end: row.end,
      prices: [row.price],
    });
  });

  return merged.slice(0, 4).map((item, index) => {
    const avgPrice = item.prices.reduce((sum, value) => sum + value, 0) / Math.max(item.prices.length, 1);
    const requestedPower = item.action === 'charge' ? 60 + index * 10 : 80 + index * 5;
    const power = constrainPowerByStorageBoundary(item.action, requestedPower, storageBoundaryConfig);
    return {
      id: `smart-${Date.now()}-${index}`,
      start: item.start,
      end: item.end,
      power,
      action: item.action,
      tariffPrice: avgPrice.toFixed(4),
    };
  });
};

const getSmartPlanResult = (
  planDate,
  { priceMode, fixedTariffPeriods = [], dynamicTariffRows = [], dynamicTariffGranularity, storageBoundaryConfig } = {}
) => {
  const sourceRows = priceMode === 'dynamic'
    ? dynamicTariffRows
    : fixedTariffPeriods.map((period) => ({
        start: period.start,
        end: period.end,
        price: period.price,
        level: period.level,
      }));
  const periods = buildSmartPlanPeriodsFromRows(sourceRows, storageBoundaryConfig);
  const spread = sourceRows.length > 0
    ? Math.max(...sourceRows.map((item) => Number(item.price) || 0)) - Math.min(...sourceRows.map((item) => Number(item.price) || 0))
    : 0.8;
  const estimatedProfit = periods.reduce(
    (sum, period) => sum + Math.abs(Number(period.power)) * Math.max(1, parseTimeToMinutes(period.end) - parseTimeToMinutes(period.start)) / 60,
    0
  ) * Math.max(spread, 0.2) * 0.42;

  return {
    date: planDate,
    profit: estimatedProfit,
    note:
      priceMode === 'dynamic'
        ? `基于${dynamicTariffGranularity === '48' ? '48点/30分钟' : '96点/15分钟'}市场电价自动识别低价充电窗口与高价放电窗口，不使用尖峰平谷等级。`
        : '基于当前固定分时电价模板，优先在谷段/深谷段充电，在峰段/尖段放电。',
    periods,
  };
};

const generateCloudForecastPrices = (days = 3, granularity = '96') => {
  const baseDate = getTodayDateString();
  return Array.from({ length: days }, (_, dayIndex) => {
    const date = addDaysToDateString(baseDate, dayIndex + 1);
    const rows = generateDynamicTariffRows(granularity, date).map((row, rowIndex) => {
      const hour = parseTimeToMinutes(row.start) / 60;
      const eveningPeak = hour >= 17 && hour < 21 ? 0.42 : 0;
      const noonPeak = hour >= 10 && hour < 14 ? 0.28 : 0;
      const valley = hour < 6 || hour >= 22 ? -0.16 : 0;
      const dayDrift = dayIndex * 0.035;
      const wave = Math.sin((rowIndex / Number(granularity)) * Math.PI * 4) * 0.045;
      return {
        ...row,
        id: `forecast-${date}-${rowIndex}`,
        price: Math.max(-0.05, 0.42 + eveningPeak + noonPeak + valley + dayDrift + wave).toFixed(4),
      };
    });
    const prices = rows.map((item) => Number(item.price));
    return {
      date,
      rows,
      source: '云端日前预测',
      status: '已同步',
      syncedAt: '刚刚',
      confidence: `${Math.max(82, 94 - dayIndex * 5)}%`,
      averagePrice: getAveragePriceFromRows(rows),
      maxPrice: Math.max(...prices),
      minPrice: Math.min(...prices),
    };
  });
};

const generateEconomicScheduleDays = (granularity = '96', historyDays = 7, futureDays = 3) => {
  const today = getTodayDateString();
  const offsets = [
    ...Array.from({ length: historyDays }, (_, index) => -historyDays + index),
    0,
    ...Array.from({ length: futureDays }, (_, index) => index + 1),
  ];
  return offsets.map((offset) => {
    const date = addDaysToDateString(today, offset);
    const rows = generateDynamicTariffRows(granularity, date).map((row, rowIndex) => {
      const hour = parseTimeToMinutes(row.start) / 60;
      const eveningPeak = hour >= 17 && hour < 21 ? 0.42 : 0;
      const noonPeak = hour >= 10 && hour < 14 ? 0.28 : 0;
      const valley = hour < 6 || hour >= 22 ? -0.16 : 0;
      const dayDrift = offset * 0.012;
      const wave = Math.sin((rowIndex / Number(granularity)) * Math.PI * 4) * 0.045;
      return {
        ...row,
        id: `economic-${date}-${rowIndex}`,
        price: Math.max(-0.05, 0.42 + eveningPeak + noonPeak + valley + dayDrift + wave).toFixed(4),
      };
    });
    const prices = rows.map((item) => Number(item.price));
    const type = offset < 0 ? 'history' : offset === 0 ? 'today' : 'future';
    return {
      date,
      rows,
      type,
      source: type === 'history' ? '历史市场价格' : type === 'today' ? '今日预测电价' : '云端日前预测',
      status: type === 'history' ? '已归档' : '已同步',
      syncedAt: type === 'history' ? '历史记录' : '刚刚',
      confidence: type === 'history' ? '实绩' : `${Math.max(82, 95 - Math.max(offset, 0) * 4)}%`,
      averagePrice: getAveragePriceFromRows(rows),
      maxPrice: Math.max(...prices),
      minPrice: Math.min(...prices),
    };
  });
};

const getAveragePriceForWindow = (rows = [], start, end) => {
  const startMinutes = parseTimeToMinutes(start);
  const endMinutes = parseTimeToMinutes(end);
  const matched = rows.filter((row) => {
    const rowStart = parseTimeToMinutes(row.start);
    const rowEnd = parseTimeToMinutes(row.end);
    return rowStart < endMinutes && rowEnd > startMinutes;
  });
  return getAveragePriceFromRows(matched.length > 0 ? matched : rows);
};

const buildEconomicPeriodsFromPrices = (priceRows = [], storageBoundaryConfig = initialStorageBoundaryConfig) => {
  const rows = priceRows
    .map((row) => ({ ...row, priceValue: Number(row.price) || 0 }))
    .filter((row) => row.start && row.end);
  if (rows.length === 0) return [];
  const sortedPrices = rows.map((row) => row.priceValue).sort((a, b) => a - b);
  const lowThreshold = sortedPrices[Math.max(0, Math.floor(sortedPrices.length * 0.25) - 1)] ?? sortedPrices[0];
  const highThreshold = sortedPrices[Math.min(sortedPrices.length - 1, Math.floor(sortedPrices.length * 0.75))] ?? sortedPrices[sortedPrices.length - 1];
  const taggedRows = rows.map((row) => ({
    ...row,
    action: row.priceValue <= lowThreshold ? '充电' : row.priceValue >= highThreshold ? '放电' : '静置',
  }));

  const merged = [];
  taggedRows.forEach((row) => {
    if (row.action === '静置') return;
    const last = merged[merged.length - 1];
    if (last && last.action === row.action && last.end === row.start) {
      last.end = row.end;
      last.prices.push(row.priceValue);
      return;
    }
    merged.push({
      start: row.start,
      end: row.end,
      action: row.action,
      prices: [row.priceValue],
    });
  });

  return merged.slice(0, 5).map((item, index) => {
    const basePower = item.action === '充电' ? 70 + index * 5 : 85 + index * 5;
    const power = constrainPowerByStorageBoundary(item.action === '充电' ? 'charge' : 'discharge', basePower, storageBoundaryConfig);
    return {
      id: `eco-period-${Date.now()}-${index}`,
      start: item.start,
      end: item.end,
      action: item.action,
      power,
      socStart: 0,
      socEnd: 0,
      reason: item.action === '充电' ? '低价窗口补能，受站级充电功率上限约束' : '高价窗口放电套利，受站级放电功率上限约束',
    };
  });
};

const calculatePlanSocCurve = (periods = [], storageBoundaryConfig = initialStorageBoundaryConfig) => {
  const boundary = getStorageBoundaryNumbers(storageBoundaryConfig);
  let soc = Math.min(Math.max(55, boundary.socMin + 5), boundary.socMax - 5);
  return periods.map((period) => {
    const durationHours = Math.max(0, parseTimeToMinutes(period.end) - parseTimeToMinutes(period.start)) / 60;
    const power = Number(period.power) || 0;
    const deltaSoc = (power * durationHours / boundary.nominalCapacityKwh) * 100;
    const socStart = soc;
    soc = Math.min(boundary.socMax, Math.max(boundary.socMin, soc + deltaSoc));
    const limited = soc !== socStart + deltaSoc;
    return {
      ...period,
      socStart: Number(socStart.toFixed(1)),
      socEnd: Number(soc.toFixed(1)),
      reason: limited ? `${period.reason}，SOC边界触发后已自动限幅` : period.reason,
    };
  });
};

const calculatePlanRevenue = (periods = [], priceRows = []) => {
  return periods.reduce((sum, period) => {
    const durationHours = Math.max(0, parseTimeToMinutes(period.end) - parseTimeToMinutes(period.start)) / 60;
    const averagePrice = getAveragePriceForWindow(priceRows, period.start, period.end);
    const energy = Math.abs(Number(period.power) || 0) * durationHours;
    return period.action === '放电' ? sum + energy * averagePrice : sum - energy * averagePrice;
  }, 0);
};

const generateEconomicPlan = (date, priceRows = [], storageBoundaryConfig = initialStorageBoundaryConfig) => {
  const periods = calculatePlanSocCurve(
    buildEconomicPeriodsFromPrices(priceRows, storageBoundaryConfig),
    storageBoundaryConfig
  );
  const revenue = calculatePlanRevenue(periods, priceRows);
  return {
    date,
    status: '待审核',
    priceSource: '云端日前预测',
    periods,
    estimatedRevenue: Number(revenue.toFixed(2)),
    estimatedCostSaving: Number((Math.max(revenue, 0) * 0.76).toFixed(2)),
    constraintSummary: `SOC ${storageBoundaryConfig.socMin}-${storageBoundaryConfig.socMax}% / 充电≤${storageBoundaryConfig.chargePowerMax}kW / 放电≤${storageBoundaryConfig.dischargePowerMax}kW`,
    updatedAt: '刚刚',
  };
};

const createEconomicPlansForSchedule = (scheduleDays = [], storageBoundaryConfig = initialStorageBoundaryConfig) => {
  return scheduleDays.reduce((result, item, index) => {
    const plan = generateEconomicPlan(item.date, item.rows, storageBoundaryConfig);
    result[item.date] = {
      ...plan,
      status: item.type === 'history' ? '已运行' : '待审核',
      priceSource: item.source,
      updatedAt: item.type === 'history' ? `${Math.min(7, index + 1)}天前` : '自动生成',
    };
    return result;
  }, {});
};

const validateEconomicPlanPeriods = (periods = [], storageBoundaryConfig = initialStorageBoundaryConfig) => {
  const boundary = getStorageBoundaryNumbers(storageBoundaryConfig);
  const normalized = [...periods]
    .map((period) => ({
      ...period,
      startMinutes: parseTimeToMinutes(period.start),
      endMinutes: parseTimeToMinutes(period.end),
      powerValue: Number(period.power),
    }))
    .sort((a, b) => a.startMinutes - b.startMinutes);
  for (const period of normalized) {
    if (!period.start || !period.end) return '开始时间和结束时间不能为空。';
    if (period.endMinutes <= period.startMinutes) return '每条策略时段必须满足开始时间小于结束时间。';
    if (Number.isNaN(period.powerValue)) return '功率必须为数值。';
    if (period.action === '充电' && (period.powerValue < boundary.chargePowerMin || period.powerValue > boundary.chargePowerMax)) {
      return `充电功率必须在 ${boundary.chargePowerMin}-${boundary.chargePowerMax} kW 范围内。`;
    }
    if (period.action === '放电' && (Math.abs(period.powerValue) < boundary.dischargePowerMin || Math.abs(period.powerValue) > boundary.dischargePowerMax)) {
      return `放电功率必须在 ${boundary.dischargePowerMin}-${boundary.dischargePowerMax} kW 范围内。`;
    }
  }
  for (let index = 1; index < normalized.length; index += 1) {
    if (normalized[index].startMinutes < normalized[index - 1].endMinutes) {
      return '同一日经济策略时段不能重叠。';
    }
  }
  return '';
};

const generateRegressionReport = (plan, priceRows = []) => {
  if (!plan) return null;
  const actualRows = plan.periods.map((period, index) => {
    const plannedPower = Number(period.power) || 0;
    const actualPower = Number((plannedPower * (0.92 + index * 0.025)).toFixed(1));
    const plannedSoc = Number(period.socEnd) || 0;
    const actualSoc = Number((plannedSoc - 1.2 + index * 0.4).toFixed(1));
    return {
      id: `reg-${plan.date}-${index}`,
      start: period.start,
      end: period.end,
      plannedPower,
      actualPower,
      plannedSoc,
      actualSoc,
      reason: index % 2 === 0 ? 'PCS限功率跟随' : 'SOC边界修正',
    };
  });
  const actualRevenue = calculatePlanRevenue(
    actualRows.map((row) => ({
      ...row,
      action: row.actualPower >= 0 ? '充电' : '放电',
      power: row.actualPower,
    })),
    priceRows
  );
  const plannedRevenue = Number(plan.estimatedRevenue) || 0;
  const deviation = plannedRevenue === 0 ? 0 : ((actualRevenue - plannedRevenue) / Math.abs(plannedRevenue)) * 100;
  return {
    date: plan.date,
    plannedRevenue,
    actualRevenue: Number(actualRevenue.toFixed(2)),
    deviationRate: Number(deviation.toFixed(1)),
    priceDeviation: '4.8%',
    powerDeviation: '7.2%',
    socDeviation: '2.1%',
    limitCount: 2,
    manualImpact: plan.status === '已运行' ? '用户修正后收益提升约 3.1%' : '暂无手动修正影响',
    suggestion: '下一次可提前 15 分钟进入高价放电窗口，并保留 5% SOC 缓冲。',
    rows: actualRows,
  };
};

const createPeakTemplateDraft = () => ({
  id: `tpl-${Date.now()}`,
  name: '',
  periods: [
    createPeakPeriod('00:00', '06:00', 60),
    createPeakPeriod('18:00', '20:00', -80),
  ],
});

const menuCatalog = [
  { key: '微网总览', icon: LayoutDashboard, description: '微电网整体运行与并离网态势总览', children: [] },
  { key: '电气拓扑', icon: GitBranch, description: '查看站级电气 SCADA 与拓扑关系', children: [] },
  { key: '能碳核算', icon: CloudRain, description: '碳核算分析与核算引擎管理', children: ['能碳核算分析', '核算引擎管理'] },
  { key: '策略中心', icon: Zap, description: '边缘 EMS 本地执行、策略配置与高级调度', children: [] },
  { key: '设备监控', icon: Activity, description: '遥测、遥控、遥调、遥信与运行联调', children: ['遥测', '遥控', '遥调', '遥信'] },
  { key: '数据统计', icon: BarChart2, description: '电量、收益、综合能源和电芯数据分析', children: ['电量报表', '综合能源报表', '收益报表', '电芯分析'] },
  { key: '故障告警', icon: ShieldAlert, description: '告警统计、规则与故障处置闭环', children: ['告警统计', '告警规则'] },
  { key: '算法管理', icon: Settings, description: '算法版本管理、模型验证与发布', children: [] },
  { key: '系统管理', icon: Database, description: '系统设置、设备档案、费率时段与数据治理', children: ['系统设置', '设备管理', '档案管理', '费率时段', '拓扑配置', '数据调整', '数据清理', '口令设置', '数据同步', '数据转发'] },
];

const defaultSecondaryMenuMap = {
  微网总览: '',
  电气拓扑: '',
  能碳核算: '能碳核算分析',
  策略中心: '模式切换',
  设备监控: '遥测',
  数据统计: '电量报表',
  故障告警: '告警统计',
  算法管理: '',
  系统管理: '档案管理',
};

const App = () => {
  const [activePrimaryMenu, setActivePrimaryMenu] = useState('策略中心');
  const [activeSecondaryMenu, setActiveSecondaryMenu] = useState(defaultSecondaryMenuMap.策略中心);
  const [activeStrategyTab, setActiveStrategyTab] = useState('模式切换');
  const [controlMode, setControlMode] = useState('local');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [gridSwitchConfig, setGridSwitchConfig] = useState(initialGridSwitchConfig);
  const [pendingGridSwitchTarget, setPendingGridSwitchTarget] = useState(null);
  const [showGridSwitchModal, setShowGridSwitchModal] = useState(false);
  
  // Edge States
  const [l3Strategy, setL3Strategy] = useState('peak_shaving');
  const [selectedL3StrategyTab, setSelectedL3StrategyTab] = useState('peak_shaving');
  const [pendingL3Strategy, setPendingL3Strategy] = useState(null);
  const [showL3SwitchModal, setShowL3SwitchModal] = useState(false);
  const [peakTemplates, setPeakTemplates] = useState(initialPeakTemplates);
  const [selectedTemplateId, setSelectedTemplateId] = useState(initialPeakTemplates[0].id);
  const [selectedMonth, setSelectedMonth] = useState(7);
  const [monthTemplateMap, setMonthTemplateMap] = useState(initialMonthTemplateMap);
  const [dayTemplateOverrides, setDayTemplateOverrides] = useState(initialDayTemplateOverrides);
  const [monthAssignEditMode, setMonthAssignEditMode] = useState(false);
  const [monthTemplateDraft, setMonthTemplateDraft] = useState(initialMonthTemplateMap);
  const [monthTemplateSnapshot, setMonthTemplateSnapshot] = useState(null);
  const [dayAssignEditMode, setDayAssignEditMode] = useState(false);
  const [dayTemplateDraft, setDayTemplateDraft] = useState(initialDayTemplateOverrides);
  const [dayTemplateSnapshot, setDayTemplateSnapshot] = useState(null);
  const [batchTemplateId, setBatchTemplateId] = useState(initialPeakTemplates[0].id);
  const [showBatchApplyModal, setShowBatchApplyModal] = useState(false);
  const [batchApplyTemplateId, setBatchApplyTemplateId] = useState(initialPeakTemplates[0].id);
  const [batchApplyDays, setBatchApplyDays] = useState([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateModalMode, setTemplateModalMode] = useState('create');
  const [templateDraft, setTemplateDraft] = useState(createPeakTemplateDraft());
  const [templateValidationError, setTemplateValidationError] = useState('');
  
  // Price Config States
  const [priceMode, setPriceMode] = useState('fixed');
  const [fixedTariffScope, setFixedTariffScope] = useState('monthly');
  const [fixedTariffTemplates, setFixedTariffTemplates] = useState(initialFixedTariffTemplates);
  const [selectedFixedTariffTemplateId, setSelectedFixedTariffTemplateId] = useState(initialFixedTariffTemplates[0].id);
  const [selectedFixedTariffMonth, setSelectedFixedTariffMonth] = useState(7);
  const [selectedFixedTariffDate, setSelectedFixedTariffDate] = useState('2026-04-16');
  const [fixedTariffError, setFixedTariffError] = useState('');
  const [fixedTariffSavedAt, setFixedTariffSavedAt] = useState('今日 08:10:00');
  const [dynamicTariffGranularity, setDynamicTariffGranularity] = useState('96');
  const [selectedDynamicTariffDate, setSelectedDynamicTariffDate] = useState('2026-04-16');
  const [dynamicTariffStore, setDynamicTariffStore] = useState(() => {
    const initialDate = '2026-04-16';
    const initialGranularity = '96';
    const rows = generateDynamicTariffRows(initialGranularity, initialDate);
    return {
      [getDynamicTariffStoreKey(initialDate, initialGranularity)]: {
        rows,
        meta: createDynamicTariffMeta(initialGranularity, { source: '本地演示数据初始化' }),
      },
    };
  });
  const [dynamicTariffRows, setDynamicTariffRows] = useState(() => generateDynamicTariffRows('96', '2026-04-16'));
  const [dynamicTariffImportMeta, setDynamicTariffImportMeta] = useState(() =>
    createDynamicTariffMeta('96', { source: '本地演示数据初始化' })
  );
  const [dynamicTariffError, setDynamicTariffError] = useState('');
  // Smart Plan Modal States
  const [showSmartPlanModal, setShowSmartPlanModal] = useState(false);
  const [smartPlanState, setSmartPlanState] = useState('idle'); // idle | calculating | result
  const [selectedPlanDate, setSelectedPlanDate] = useState('2026-04-16');
  const [smartPlanFromTemplateModal, setSmartPlanFromTemplateModal] = useState(false);
  const [smartPlanDraftPeriods, setSmartPlanDraftPeriods] = useState([]);
  const [collectorDevices, setCollectorDevices] = useState(initialCollectorDevices);
  const [selectedCollectorId, setSelectedCollectorId] = useState(initialCollectorDevices[0].id);
  const [signalPoints, setSignalPoints] = useState(initialSignalPoints);
  const [envStrategies, setEnvStrategies] = useState(initialEnvStrategyList);
  const [envConfigSubtab, setEnvConfigSubtab] = useState('signals');
  const [showCollectorModal, setShowCollectorModal] = useState(false);
  const [collectorModalSelection, setCollectorModalSelection] = useState([]);
  const [collectorModalPreviewId, setCollectorModalPreviewId] = useState(availableCollectorDevices[0].id);
  const [signalsEditMode, setSignalsEditMode] = useState(false);
  const [signalDraftSnapshot, setSignalDraftSnapshot] = useState(null);
  const [showStrategyModal, setShowStrategyModal] = useState(false);
  const [strategyModalMode, setStrategyModalMode] = useState('create');
  const [strategyDraft, setStrategyDraft] = useState(null);
  const [pointPickerState, setPointPickerState] = useState(null);
  const [showAntiBackflowModal, setShowAntiBackflowModal] = useState(false);
  const [showDemandControlModal, setShowDemandControlModal] = useState(false);
  const [antiBackflowConfig, setAntiBackflowConfig] = useState(initialAntiBackflowConfig);
  const [demandControlConfig, setDemandControlConfig] = useState(initialDemandControlConfig);
  const [storageBoundaryConfig, setStorageBoundaryConfig] = useState(initialStorageBoundaryConfig);
  const [storageBoundaryDraft, setStorageBoundaryDraft] = useState(initialStorageBoundaryConfig);
  const [storageBoundaryError, setStorageBoundaryError] = useState('');
  const [showStorageBoundaryModal, setShowStorageBoundaryModal] = useState(false);
  const [economicScheduleDays, setEconomicScheduleDays] = useState(() =>
    generateEconomicScheduleDays('96')
  );
  const [selectedEconomicDate, setSelectedEconomicDate] = useState(getTodayDateString());
  const [economicPriceView, setEconomicPriceView] = useState('chart');
  const [dailyEconomicPlans, setDailyEconomicPlans] = useState(() => {
    const initialScheduleDays = generateEconomicScheduleDays('96');
    return createEconomicPlansForSchedule(initialScheduleDays, initialStorageBoundaryConfig);
  });
  const [economicPlanEditMode, setEconomicPlanEditMode] = useState(null);
  const [economicPlanDraft, setEconomicPlanDraft] = useState(null);
  const [economicPlanError, setEconomicPlanError] = useState('');
  const [selectedRegressionDate, setSelectedRegressionDate] = useState('');
  const [regressionReports, setRegressionReports] = useState({});
  const [showRegressionDetailModal, setShowRegressionDetailModal] = useState(false);
  const [planCurveSource, setPlanCurveSource] = useState('user');
  const [planCurveResourceConfig, setPlanCurveResourceConfig] = useState(initialPlanCurveResourceConfig);
  const [planCurveTargetAdjustments, setPlanCurveTargetAdjustments] = useState({
    offset: '0',
    multiplier: '1',
    tolerance: '10',
  });
  const [selectedMonitorStrategyId, setSelectedMonitorStrategyId] = useState('');
  const economicDateScrollerRef = useRef(null);
  const todayForecastChipRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!collectorDevices.find((item) => item.id === selectedCollectorId) && collectorDevices.length > 0) {
      setSelectedCollectorId(collectorDevices[0].id);
    }
  }, [collectorDevices, selectedCollectorId]);

  useEffect(() => {
    if (!peakTemplates.find((item) => item.id === selectedTemplateId) && peakTemplates.length > 0) {
      setSelectedTemplateId(peakTemplates[0].id);
    }
  }, [peakTemplates, selectedTemplateId]);

  useEffect(() => {
    if (selectedL3StrategyTab !== 'economic') return;
    const timer = window.setTimeout(() => {
      todayForecastChipRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [selectedL3StrategyTab, economicScheduleDays]);

  useEffect(() => {
    const currentKey = getDynamicTariffStoreKey(selectedDynamicTariffDate, dynamicTariffGranularity);
    setDynamicTariffStore((prev) => {
      if (prev[currentKey]) return prev;
      return {
        ...prev,
        [currentKey]: {
          rows: generateDynamicTariffRows(dynamicTariffGranularity, selectedDynamicTariffDate),
          meta: createDynamicTariffMeta(dynamicTariffGranularity, {
            source: `${dynamicTariffGranularity === '96' ? '96点/15分钟' : '48点/30分钟'}演示初始化`,
            importedAt: '未保存',
            saved: false,
          }),
        },
      };
    });
  }, [selectedDynamicTariffDate, dynamicTariffGranularity]);

  useEffect(() => {
    const currentKey = getDynamicTariffStoreKey(selectedDynamicTariffDate, dynamicTariffGranularity);
    const currentEntry = dynamicTariffStore[currentKey];
    if (currentEntry) {
      setDynamicTariffRows(currentEntry.rows);
      setDynamicTariffImportMeta(currentEntry.meta);
    }
  }, [dynamicTariffStore, selectedDynamicTariffDate, dynamicTariffGranularity]);

  const formatDate = (date) => {
    return `${date.getFullYear()}/${(date.getMonth()+1).toString().padStart(2,'0')}/${date.getDate().toString().padStart(2,'0')}`;
  };

  const formatTime = (date) => {
    return `${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}:${date.getSeconds().toString().padStart(2,'0')}`;
  };

  const strategyDevices = getStrategyDevices(collectorDevices);
  const selectedCollector = collectorDevices.find((item) => item.id === selectedCollectorId) || collectorDevices[0];
  const filteredSignals = signalPoints.filter((item) => item.collectorDeviceId === selectedCollectorId);
  const diSignals = filteredSignals.filter((item) => item.direction === 'DI');
  const doSignals = filteredSignals.filter((item) => item.direction === 'DO');
  const diCount = signalPoints.filter((item) => item.direction === 'DI').length;
  const doCount = signalPoints.filter((item) => item.direction === 'DO').length;
  const collectorPreviewSignals = signalPoints.filter((item) => item.collectorDeviceId === collectorModalPreviewId);
  const previewDiSignals = collectorPreviewSignals.filter((item) => item.direction === 'DI');
  const previewDoSignals = collectorPreviewSignals.filter((item) => item.direction === 'DO');
  const pointPickerOptions = pointPickerState
    ? getPointOptionsForDevice(pointPickerState.deviceId, pointPickerState.mode, signalPoints)
    : [];
  const selectedPeakTemplate = peakTemplates.find((item) => item.id === selectedTemplateId) || peakTemplates[0];
  const selectedMonthDefaultTemplateId = monthTemplateMap[selectedMonth] || peakTemplates[0]?.id;
  const selectedMonthDefaultTemplate = peakTemplates.find((item) => item.id === selectedMonthDefaultTemplateId) || peakTemplates[0];
  const selectedMonthDraftTemplateId = monthTemplateDraft[selectedMonth] || selectedMonthDefaultTemplateId;
  const selectedMonthDraftTemplate = peakTemplates.find((item) => item.id === selectedMonthDraftTemplateId) || selectedMonthDefaultTemplate;
  const previewTemplate = selectedPeakTemplate;
  const previewTemplateSummary = summarizePeakTemplate(previewTemplate);
  const selectedMonthDays = Array.from({ length: getDaysInMonth(selectedMonth) }, (_, index) => index + 1);
  const selectedMonthCalendarCells = getCalendarCells(selectedMonth);
  const selectedFixedTariffTemplate =
    fixedTariffTemplates.find((item) => item.id === selectedFixedTariffTemplateId) || fixedTariffTemplates[0];
  const fixedTariffCoverageMinutes = (selectedFixedTariffTemplate?.periods || []).reduce(
    (sum, period) => sum + Math.max(0, parseTimeToMinutes(period.end) - parseTimeToMinutes(period.start)),
    0
  );
  const fixedTariffCoverageText = `${Math.round((fixedTariffCoverageMinutes / 1440) * 100)}%`;
  const dynamicAveragePrice =
    dynamicTariffRows.reduce((sum, row) => sum + (Number(row.price) || 0), 0) / Math.max(dynamicTariffRows.length, 1);
  const selectedDynamicDateParts = parseDateParts(selectedDynamicTariffDate);
  const dynamicCalendarCells = getCalendarCells(selectedDynamicDateParts.month, selectedDynamicDateParts.year);
  const dynamicMonthLabel = `${selectedDynamicDateParts.year}年${selectedDynamicDateParts.month}月`;
  const cloudForecastPriceDays = economicScheduleDays;
  const selectedForecastDate = selectedEconomicDate;
  const selectedForecastDay =
    economicScheduleDays.find((item) => item.date === selectedEconomicDate) || economicScheduleDays.find((item) => item.type === 'today') || economicScheduleDays[0];
  const selectedEconomicPlan = selectedEconomicDate ? dailyEconomicPlans[selectedEconomicDate] : null;
  const selectedRegressionReport = selectedRegressionDate ? regressionReports[selectedRegressionDate] : null;
  const currentPrimaryMenu = menuCatalog.find((item) => item.key === activePrimaryMenu) || menuCatalog[0];
  const CurrentPrimaryIcon = currentPrimaryMenu.icon;
  const smartPlanResult = getSmartPlanResult(selectedPlanDate, {
    priceMode,
    fixedTariffPeriods: selectedFixedTariffTemplate?.periods || [],
    dynamicTariffRows,
    dynamicTariffGranularity,
    storageBoundaryConfig,
  });
  const l3StrategyMeta = {
    peak_shaving: { label: '削峰填谷', description: '基于时段模板执行充放电，支持按月默认模板和特殊日期覆盖进行分配。' },
    economic: { label: '智能经济调度', description: '优先保障不超需量，在分时电价窗口内结合预测模型自动搜寻最佳充放电时机。' },
    plan_curve: { label: '计划曲线', description: '接收用户或虚拟电厂计划曲线，并分解到储能、光伏、充电桩和可控负荷。' },
    green: { label: '绿电消纳优先', description: '跟随光伏实时出力曲线，最大化微网内部储能吸收率，减少并网倒送与弃光。' },
  };
  const activeStrategyMeta = l3StrategyMeta[l3Strategy];
  const pendingStrategyMeta = pendingL3Strategy ? l3StrategyMeta[pendingL3Strategy] : null;
  const planCurveData = generatePlanCurveDemo(planCurveSource, planCurveResourceConfig, planCurveTargetAdjustments);
  const pendingGridSwitchMeta = pendingGridSwitchTarget ? getGridSwitchModeMeta(pendingGridSwitchTarget) : null;
  const controlModeLabelMap = {
    local: '孤立/断网模式',
    cloud_edge: '云边协同模式',
    remote: '远方模式',
  };
  const strategyMonitorItems = [
    ...envStrategies
      .filter((item) => item.enabled)
      .map((item) => ({
        id: `l0-${item.id}`,
        layer: 'L0 环境联锁',
        name: item.name,
        status: '运行中',
        priority: item.priority,
        target: item.deviceActions?.map((action) => getDeviceName(strategyDevices, action.deviceId)).join('、') || '平台动作',
        latestAction: formatActionLabel(item.deviceActions?.[0], strategyDevices) || item.platformAction?.type || '策略待命',
        updatedAt: '刚刚',
        description: item.remark || '动环联锁策略已启用。',
      })),
    ...(antiBackflowConfig.enabled ? [{
      id: 'l1-anti-backflow',
      layer: 'L1 硬性约束',
      name: '防逆功率保护',
      status: antiBackflowConfig.status,
      priority: 'P1',
      target: '并网点 / PCS / 光伏',
      latestAction: antiBackflowConfig.latestAction,
      updatedAt: antiBackflowConfig.lastActionAt,
      description: antiBackflowConfig.summaryTarget,
    }] : []),
    ...(demandControlConfig.enabled ? [{
      id: 'l1-demand-control',
      layer: 'L1 硬性约束',
      name: '需量控制',
      status: demandControlConfig.status,
      priority: demandControlConfig.executionLevel,
      target: '储能 / 有序充电',
      latestAction: demandControlConfig.latestAction,
      updatedAt: demandControlConfig.lastActionAt,
      description: `限制 ${demandControlConfig.limitValue}kW，目标 ${demandControlConfig.targetValue}kW。`,
    }] : []),
    {
      id: 'l2-control-mode',
      layer: 'L2 模式/并离网',
      name: '控制模式',
      status: '生效中',
      priority: 'L2',
      target: '边缘EMS控制权',
      latestAction: controlModeLabelMap[controlMode],
      updatedAt: formatTime(currentTime),
      description: '当前控制权模式决定本地、云端和远方调度的优先关系。',
    },
    {
      id: 'l2-grid-switch',
      layer: 'L2 模式/并离网',
      name: '并离网状态',
      status: gridSwitchConfig.switchStatus,
      priority: gridSwitchConfig.topology === 'with_sts' ? 'STS快速切换' : 'EMS顺序切换',
      target: 'QF / STS / PCS',
      latestAction: `${getGridSwitchModeMeta(gridSwitchConfig.mode).label} / ${gridSwitchConfig.pcsStatus}`,
      updatedAt: gridSwitchConfig.lastSwitchAt,
      description: `QF1 ${gridSwitchConfig.qf1Status}，QF2 ${gridSwitchConfig.qf2Status}，SOC ${gridSwitchConfig.soc}。`,
    },
    {
      id: 'l3-active-strategy',
      layer: 'L3 智能策略',
      name: activeStrategyMeta.label,
      status: '运行中',
      priority: '唯一运行策略',
      target: l3Strategy === 'plan_curve' ? '站级计划 / 设备分解' : '源网荷储充协同',
      latestAction: l3Strategy === 'plan_curve' ? `计划跟踪偏差 ${planCurveData.summary.deviation}kW` : activeStrategyMeta.description,
      updatedAt: '刚刚',
      description: activeStrategyMeta.description,
    },
  ];

  const openL3SwitchModal = (strategy = l3Strategy) => {
    setPendingL3Strategy(strategy);
    setShowL3SwitchModal(true);
  };

  const confirmL3StrategySwitch = () => {
    if (!pendingL3Strategy) return;
    setL3Strategy(pendingL3Strategy);
    setSelectedL3StrategyTab(pendingL3Strategy);
    setPendingL3Strategy(null);
    setShowL3SwitchModal(false);
  };

  const closeL3SwitchModal = () => {
    setPendingL3Strategy(null);
    setShowL3SwitchModal(false);
  };

  const updateGridSwitchTopology = (topology) => {
    setGridSwitchConfig((prev) => ({
      ...prev,
      topology,
      stsStatus: topology === 'with_sts' ? (prev.mode === 'grid' ? '并网侧投入' : '离网侧投入') : '未配置',
      switchStatus: topology === 'with_sts' ? 'STS通道就绪' : prev.switchStatus,
    }));
  };

  const openGridSwitchModal = (targetMode) => {
    setPendingGridSwitchTarget(targetMode);
    setShowGridSwitchModal(true);
  };

  const closeGridSwitchModal = () => {
    setPendingGridSwitchTarget(null);
    setShowGridSwitchModal(false);
  };

  const confirmGridSwitch = () => {
    if (!pendingGridSwitchTarget) return;
    const isIsland = pendingGridSwitchTarget === 'island';
    setGridSwitchConfig((prev) => ({
      ...prev,
      mode: pendingGridSwitchTarget,
      switchStatus: isIsland ? '离网稳定运行' : '并网稳定运行',
      lastSwitchAt: '刚刚',
      pcsStatus: isIsland ? 'VF离网支撑' : 'PQ并网',
      qf1Status: isIsland ? '分闸' : '合闸',
      qf2Status: '合闸',
      stsStatus: prev.topology === 'with_sts' ? (isIsland ? '离网侧投入' : '并网侧投入') : '未配置',
    }));
    closeGridSwitchModal();
  };

  const updatePlanCurveResource = (resourceId, field, value) => {
    setPlanCurveResourceConfig((prev) =>
      prev.map((item) => (item.id === resourceId ? { ...item, [field]: value } : item))
    );
  };

  const updatePlanCurveTargetAdjustment = (field, value) => {
    setPlanCurveTargetAdjustments((prev) => ({ ...prev, [field]: value }));
  };

  const updateSignalPoint = (id, field, value) => {
    setSignalPoints((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const startSignalsEdit = () => {
    setSignalDraftSnapshot(JSON.parse(JSON.stringify(signalPoints)));
    setSignalsEditMode(true);
  };

  const saveSignalsEdit = () => {
    setSignalsEditMode(false);
    setSignalDraftSnapshot(null);
  };

  const cancelSignalsEdit = () => {
    if (signalDraftSnapshot) {
      setSignalPoints(signalDraftSnapshot);
    }
    setSignalsEditMode(false);
    setSignalDraftSnapshot(null);
  };

  const openCollectorModal = () => {
    setCollectorModalSelection([]);
    setCollectorModalPreviewId(availableCollectorDevices[0]?.id || '');
    setShowCollectorModal(true);
  };

  const toggleCollectorModalSelection = (collectorId) => {
    setCollectorModalSelection((prev) =>
      prev.includes(collectorId) ? prev.filter((item) => item !== collectorId) : [...prev, collectorId]
    );
  };

  const confirmCollectorAssociation = () => {
    const existingIds = new Set(collectorDevices.map((item) => item.id));
    const newCollectors = availableCollectorDevices.filter(
      (item) => collectorModalSelection.includes(item.id) && !existingIds.has(item.id)
    );

    if (newCollectors.length > 0) {
      setCollectorDevices((prev) => [...prev, ...newCollectors]);
      if (!selectedCollectorId && newCollectors[0]) {
        setSelectedCollectorId(newCollectors[0].id);
      }
    }

    setShowCollectorModal(false);
    setCollectorModalSelection([]);
  };

  const toggleStrategyEnabled = (id) => {
    setEnvStrategies((prev) =>
      prev.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item))
    );
  };

  const closeStrategyModal = () => {
    setShowStrategyModal(false);
    setStrategyDraft(null);
    setPointPickerState(null);
  };

  const openStrategyModal = (mode, strategy) => {
    setStrategyModalMode(mode);
    if (mode === 'edit' && strategy) {
      setStrategyDraft(JSON.parse(JSON.stringify(strategy)));
    } else {
      setStrategyDraft(createStrategy(selectedCollectorId));
    }
    setShowStrategyModal(true);
  };

  const updateStrategyDraftField = (field, value) => {
    setStrategyDraft((prev) => ({ ...prev, [field]: value }));
  };

  const updateStrategyDraftCondition = (index, field, value) => {
    setStrategyDraft((prev) => ({
      ...prev,
      conditions: prev.conditions.map((condition, conditionIndex) =>
        conditionIndex === index
          ? {
              ...condition,
              [field]: value,
              ...(field === 'deviceId'
                ? {
                    pointCode: '',
                    pointLabel: '',
                    value: '0→1',
                  }
                : {}),
            }
          : condition
      ),
    }));
  };

  const updateStrategyDraftDeviceAction = (index, field, value) => {
    setStrategyDraft((prev) => ({
      ...prev,
      deviceActions: prev.deviceActions.map((action, actionIndex) =>
        actionIndex === index
          ? {
              ...action,
              [field]: value,
              ...(field === 'deviceId'
                ? {
                    pointCode: '',
                    pointLabel: '',
                    command: '',
                  }
                : {}),
            }
          : action
      ),
    }));
  };

  const updateStrategyDraftPlatformAction = (field, value) => {
    setStrategyDraft((prev) => ({
      ...prev,
      platformAction: {
        ...prev.platformAction,
        [field]: value,
        ...(field === 'type' && value === '无动作' ? { alarmLevel: '' } : {}),
        ...(field === 'type' && value === '触发告警' && !prev.platformAction.alarmLevel ? { alarmLevel: '重要' } : {}),
      },
    }));
  };

  const saveStrategyDraft = () => {
    if (!strategyDraft) return;

    const normalizedDraft = normalizeStrategyActionOrders({
      ...strategyDraft,
      platformAction: {
        ...strategyDraft.platformAction,
        order:
          strategyDraft.platformAction?.order ??
          ((strategyDraft.deviceActions || []).length + 1),
      },
    });

    if (strategyModalMode === 'create') {
      setEnvStrategies((prev) => [normalizedDraft, ...prev]);
    } else {
      setEnvStrategies((prev) =>
        prev.map((item) => (item.id === normalizedDraft.id ? normalizedDraft : item))
      );
    }

    closeStrategyModal();
  };

  const duplicateStrategy = (strategyId) => {
    const target = envStrategies.find((item) => item.id === strategyId);
    if (!target) return;

    const duplicated = {
      ...target,
      id: `${target.id}-COPY-${Date.now()}`,
      code: `${target.code}-COPY`,
      name: `${target.name}（副本）`,
    };
    setStrategyModalMode('create');
    setStrategyDraft(duplicated);
    setShowStrategyModal(true);
  };

  const addStrategyCondition = () => {
    setStrategyDraft((prev) => ({
      ...prev,
      conditions: [
        ...prev.conditions,
        createCondition(prev.conditions[prev.conditions.length - 1]?.deviceId || selectedCollectorId),
      ],
    }));
  };

  const addStrategyDeviceAction = () => {
    setStrategyDraft((prev) => ({
      ...normalizeStrategyActionOrders({
        ...prev,
        deviceActions: [
          ...prev.deviceActions,
          createDeviceAction(
            prev.deviceActions[prev.deviceActions.length - 1]?.deviceId || selectedCollectorId,
            prev.deviceActions.length + 1
          ),
        ],
      }),
    }));
  };

  const removeStrategyCondition = (index) => {
    setStrategyDraft((prev) => ({
      ...prev,
      conditions: prev.conditions.filter((_, conditionIndex) => conditionIndex !== index),
    }));
  };

  const removeStrategyAction = (index) => {
    setStrategyDraft((prev) => ({
      ...normalizeStrategyActionOrders({
        ...prev,
        deviceActions: prev.deviceActions.filter((_, actionIndex) => actionIndex !== index),
      }),
    }));
  };

  const moveStrategyAction = (type, index, direction) => {
    setStrategyDraft((prev) => reorderCombinedActions(prev, type, index, direction));
  };

  const reorderStrategyDeviceAction = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    setStrategyDraft((prev) => {
      const nextActions = [...prev.deviceActions].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      const [moved] = nextActions.splice(fromIndex, 1);
      nextActions.splice(toIndex, 0, moved);
      return normalizeStrategyActionOrders({
        ...prev,
        deviceActions: renumberDeviceActions(nextActions),
      });
    });
  };

  const openPointPicker = (target, index, deviceId, mode) => {
    if (!deviceId) return;
    setPointPickerState({ target, index, deviceId, mode });
  };

  const applyPointSelection = (point) => {
    if (!pointPickerState) return;

    if (pointPickerState.target === 'condition') {
      updateStrategyDraftCondition(pointPickerState.index, 'pointCode', point.pointCode);
      updateStrategyDraftCondition(pointPickerState.index, 'pointLabel', point.pointLabel);
    } else {
      updateStrategyDraftDeviceAction(pointPickerState.index, 'pointCode', point.pointCode);
      updateStrategyDraftDeviceAction(pointPickerState.index, 'pointLabel', point.pointLabel);
      const commandOptions = point.commands || ['动作', '复位'];
      updateStrategyDraftDeviceAction(pointPickerState.index, 'command', commandOptions[0]);
    }

    setPointPickerState(null);
  };

  const updateAntiBackflowField = (field, value) => {
    setAntiBackflowConfig((prev) => ({ ...prev, [field]: value }));
  };

  const toggleAntiBackflow = () => {
    setAntiBackflowConfig((prev) => ({
      ...prev,
      enabled: !prev.enabled,
      status: prev.enabled ? '已关闭' : '运行中',
      latestAction: prev.enabled ? '策略已手动关闭' : '策略恢复投入运行',
      lastActionAt: '刚刚',
    }));
  };

  const updateDemandControlField = (field, value) => {
    setDemandControlConfig((prev) => ({ ...prev, [field]: value }));
  };

  const toggleDemandControl = () => {
    setDemandControlConfig((prev) => ({
      ...prev,
      enabled: !prev.enabled,
      status: prev.enabled ? '已关闭' : '运行中',
      latestAction: prev.enabled ? '需量控制已手动关闭' : '需量控制恢复投入运行',
      lastActionAt: '刚刚',
    }));
  };

  const openAntiBackflowModal = () => {
    setShowAntiBackflowModal(true);
  };

  const openDemandControlModal = () => {
    setShowDemandControlModal(true);
  };

  const openStorageBoundaryModal = () => {
    setStorageBoundaryDraft({ ...storageBoundaryConfig });
    setStorageBoundaryError('');
    setShowStorageBoundaryModal(true);
  };

  const updateStorageBoundaryDraft = (field, value) => {
    setStorageBoundaryDraft((prev) => ({ ...prev, [field]: value }));
  };

  const saveStorageBoundaryDraft = () => {
    const validationMessage = validateStorageBoundaryConfig(storageBoundaryDraft);
    if (validationMessage) {
      setStorageBoundaryError(validationMessage);
      return;
    }
    setStorageBoundaryConfig({ ...storageBoundaryDraft });
    setStorageBoundaryError('');
    setShowStorageBoundaryModal(false);
  };

  const syncCloudForecastPrices = () => {
    const nextScheduleDays = generateEconomicScheduleDays(dynamicTariffGranularity);
    setEconomicScheduleDays(nextScheduleDays);
    setSelectedEconomicDate(getTodayDateString());
    setDailyEconomicPlans(createEconomicPlansForSchedule(nextScheduleDays, storageBoundaryConfig));
    setRegressionReports({});
    setSelectedRegressionDate('');
    setEconomicPlanEditMode(null);
    setEconomicPlanDraft(null);
  };

  const generateDailyEconomicPlan = (date) => {
    const forecastDay = economicScheduleDays.find((item) => item.date === date);
    if (!forecastDay) return;
    const plan = generateEconomicPlan(date, forecastDay.rows, storageBoundaryConfig);
    setDailyEconomicPlans((prev) => ({
      ...prev,
      [date]: {
        ...plan,
        status: forecastDay.type === 'history' ? '已运行' : '待审核',
        priceSource: forecastDay.source,
        updatedAt: '系统重新生成',
      },
    }));
    setEconomicPlanEditMode(null);
    setEconomicPlanDraft(null);
    setEconomicPlanError('');
  };

  const startEconomicPlanEdit = (date) => {
    const plan = dailyEconomicPlans[date];
    if (!plan) return;
    setEconomicPlanEditMode(date);
    setEconomicPlanDraft(JSON.parse(JSON.stringify(plan)));
    setEconomicPlanError('');
  };

  const cancelEconomicPlanEdit = () => {
    setEconomicPlanEditMode(null);
    setEconomicPlanDraft(null);
    setEconomicPlanError('');
  };

  const updateEconomicPlanDraftPeriod = (periodId, field, value) => {
    setEconomicPlanDraft((prev) => ({
      ...prev,
      periods: prev.periods.map((period) => {
        if (period.id !== periodId) return period;
        if (field === 'action') {
          const nextPower = value === '充电'
            ? Math.abs(Number(period.power) || Number(storageBoundaryConfig.chargePowerMin) || 1)
            : -Math.abs(Number(period.power) || Number(storageBoundaryConfig.dischargePowerMin) || 1);
          return { ...period, action: value, power: nextPower };
        }
        if (field === 'power') {
          const rawPower = Number(value);
          const signedPower = period.action === '充电' ? Math.abs(rawPower || 0) : -Math.abs(rawPower || 0);
          return { ...period, power: Number.isNaN(rawPower) ? '' : signedPower };
        }
        return { ...period, [field]: value };
      }),
    }));
  };

  const saveEconomicPlanDraft = () => {
    if (!economicPlanDraft) return;
    const validationMessage = validateEconomicPlanPeriods(economicPlanDraft.periods, storageBoundaryConfig);
    if (validationMessage) {
      setEconomicPlanError(validationMessage);
      return;
    }
    const forecastDay = economicScheduleDays.find((item) => item.date === economicPlanDraft.date);
    const periods = calculatePlanSocCurve(
      [...economicPlanDraft.periods].sort((a, b) => parseTimeToMinutes(a.start) - parseTimeToMinutes(b.start)),
      storageBoundaryConfig
    );
    const revenue = calculatePlanRevenue(periods, forecastDay?.rows || []);
    const nextPlan = {
      ...economicPlanDraft,
      status: '待审核',
      periods,
      estimatedRevenue: Number(revenue.toFixed(2)),
      estimatedCostSaving: Number((Math.max(revenue, 0) * 0.76).toFixed(2)),
      constraintSummary: `SOC ${storageBoundaryConfig.socMin}-${storageBoundaryConfig.socMax}% / 充电≤${storageBoundaryConfig.chargePowerMax}kW / 放电≤${storageBoundaryConfig.dischargePowerMax}kW`,
      updatedAt: '刚刚',
    };
    setDailyEconomicPlans((prev) => ({ ...prev, [nextPlan.date]: nextPlan }));
    setEconomicPlanEditMode(null);
    setEconomicPlanDraft(null);
    setEconomicPlanError('');
  };

  const publishEconomicPlan = (date) => {
    setDailyEconomicPlans((prev) => ({
      ...prev,
      [date]: {
        ...prev[date],
        status: '已发布',
        updatedAt: '刚刚',
      },
    }));
  };

  const markEconomicPlanAsRun = (date) => {
    setDailyEconomicPlans((prev) => ({
      ...prev,
      [date]: {
        ...prev[date],
        status: '已运行',
        updatedAt: '刚刚',
      },
    }));
    setSelectedRegressionDate(date);
  };

  const generateRegressionForPlan = (date) => {
    const plan = dailyEconomicPlans[date];
    const forecastDay = economicScheduleDays.find((item) => item.date === date);
    if (!plan) return;
    const report = generateRegressionReport(plan, forecastDay?.rows || []);
    setRegressionReports((prev) => ({ ...prev, [date]: report }));
    setDailyEconomicPlans((prev) => ({
      ...prev,
      [date]: {
        ...prev[date],
        status: '已回归',
        updatedAt: '刚刚',
      },
    }));
    setSelectedRegressionDate(date);
  };

  const closeTemplateModal = () => {
    setShowTemplateModal(false);
    setTemplateValidationError('');
    setShowSmartPlanModal(false);
    setSmartPlanState('idle');
    setSmartPlanFromTemplateModal(false);
    setSmartPlanDraftPeriods([]);
  };

  const startMonthAssignEdit = () => {
    setMonthTemplateSnapshot(JSON.parse(JSON.stringify(monthTemplateMap)));
    setMonthTemplateDraft(JSON.parse(JSON.stringify(monthTemplateMap)));
    setMonthAssignEditMode(true);
  };

  const cancelMonthTemplateDraft = () => {
    setMonthTemplateDraft(monthTemplateSnapshot || monthTemplateMap);
    setMonthTemplateSnapshot(null);
    setMonthAssignEditMode(false);
  };

  const saveMonthTemplateDraft = () => {
    const previous = monthTemplateSnapshot || monthTemplateMap;
    setMonthTemplateMap(monthTemplateDraft);
    setDayTemplateOverrides((prev) => {
      const next = { ...prev };
      Object.entries(monthTemplateDraft).forEach(([monthKey, templateId]) => {
        if (previous[monthKey] !== templateId) {
          const monthPrefix = `${String(monthKey).padStart(2, '0')}-`;
          Object.keys(next).forEach((key) => {
            if (key.startsWith(monthPrefix)) delete next[key];
          });
        }
      });
      return next;
    });
    setMonthTemplateSnapshot(null);
    setMonthAssignEditMode(false);
  };

  const startDayAssignEdit = () => {
    setDayTemplateSnapshot(JSON.parse(JSON.stringify(dayTemplateOverrides)));
    setDayTemplateDraft(JSON.parse(JSON.stringify(dayTemplateOverrides)));
    setDayAssignEditMode(true);
  };

  const cancelDayTemplateDraft = () => {
    setDayTemplateDraft(dayTemplateSnapshot || dayTemplateOverrides);
    setDayTemplateSnapshot(null);
    setBatchApplyDays([]);
    setShowBatchApplyModal(false);
    setDayAssignEditMode(false);
  };

  const saveDayTemplateDraft = () => {
    setDayTemplateOverrides(dayTemplateDraft);
    setDayTemplateSnapshot(null);
    setBatchApplyDays([]);
    setShowBatchApplyModal(false);
    setDayAssignEditMode(false);
  };

  const openTemplateModal = (mode, template = null) => {
    setTemplateModalMode(mode);
    if (mode === 'edit' && template) {
      setTemplateDraft(clonePeakTemplate(template));
    } else if (mode === 'copy' && template) {
      setTemplateDraft({
        ...clonePeakTemplate(template),
        id: `tpl-${Date.now()}`,
        name: `${template.name} - 副本`,
      });
    } else {
      setTemplateDraft(createPeakTemplateDraft());
    }
    setTemplateValidationError('');
    setShowTemplateModal(true);
  };

  const updateTemplateDraftField = (field, value) => {
    setTemplateDraft((prev) => ({ ...prev, [field]: value }));
  };

  const openSmartPlanForTemplate = () => {
    setSmartPlanFromTemplateModal(true);
    setSmartPlanState('idle');
    setSmartPlanDraftPeriods([]);
    setShowSmartPlanModal(true);
  };

  const closeSmartPlanModal = () => {
    setShowSmartPlanModal(false);
    setSmartPlanState('idle');
    setSmartPlanDraftPeriods([]);
    setSmartPlanFromTemplateModal(false);
  };

  const startSmartPlanCalculation = () => {
    setSmartPlanState('calculating');
    setSmartPlanDraftPeriods([]);
    setTimeout(() => {
      setSmartPlanDraftPeriods(smartPlanResult.periods.map((period) => ({ ...period })));
      setSmartPlanState('result');
    }, 2500);
  };

  const applySmartPlanToTemplateDraft = () => {
    if (!smartPlanFromTemplateModal || smartPlanDraftPeriods.length === 0) return;
    setTemplateDraft((prev) => ({
      ...prev,
      periods: smartPlanDraftPeriods.map((period) => ({
        id: `period-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
        start: period.start,
        end: period.end,
        power: String(period.power),
        action: Number(period.power) >= 0 ? 'charge' : 'discharge',
      })),
    }));
    setTemplateValidationError('');
    closeSmartPlanModal();
  };

  const updateTemplateDraftPeriod = (periodId, field, value) => {
    setTemplateDraft((prev) => ({
      ...prev,
      periods: prev.periods.map((period) => {
        if (period.id !== periodId) return period;

        if (field === 'power') {
          const nextPower = Number(value);
          const normalizedPower = Number.isNaN(nextPower) ? '' : String(nextPower);
          return {
            ...period,
            power: normalizedPower,
            action: nextPower >= 0 ? 'charge' : 'discharge',
          };
        }

        if (field === 'action') {
          return {
            ...period,
            action: value,
            power: String(normalizePeakPowerByAction(value, period.power || 1)),
          };
        }

        return { ...period, [field]: value };
      }),
    }));
  };

  const addTemplateDraftPeriod = () => {
    setTemplateDraft((prev) => ({
      ...prev,
      periods: [...prev.periods, createPeakPeriod('21:00', '23:00', -60)],
    }));
  };

  const removeTemplateDraftPeriod = (periodId) => {
    setTemplateDraft((prev) => ({
      ...prev,
      periods: prev.periods.filter((period) => period.id !== periodId),
    }));
  };

  const validateTemplateDraft = (draft) => {
    if (!draft.name.trim()) return '模板名称不能为空。';
    if (draft.periods.length === 0) return '至少需要一条充放电时段。';

    const normalizedPeriods = draft.periods
      .map((period) => ({
        ...period,
        startMinutes: parseTimeToMinutes(period.start),
        endMinutes: parseTimeToMinutes(period.end),
        powerValue: Number(period.power),
      }))
      .sort((a, b) => a.startMinutes - b.startMinutes);

    for (const period of normalizedPeriods) {
      if (!period.start || !period.end) return '开始时间和结束时间不能为空。';
      if (period.endMinutes <= period.startMinutes) return '每条时段都需要满足开始时间小于结束时间。';
      if (!period.powerValue) return '功率不能为 0。';
      if (period.powerValue > 0 && period.powerValue > Number(storageBoundaryConfig.chargePowerMax)) {
        return `充电功率不能超过储能运行边界 ${storageBoundaryConfig.chargePowerMax} kW。`;
      }
      if (period.powerValue < 0 && Math.abs(period.powerValue) > Number(storageBoundaryConfig.dischargePowerMax)) {
        return `放电功率不能超过储能运行边界 ${storageBoundaryConfig.dischargePowerMax} kW。`;
      }
    }

    for (let i = 1; i < normalizedPeriods.length; i += 1) {
      if (normalizedPeriods[i].startMinutes < normalizedPeriods[i - 1].endMinutes) {
        return '同一模板内时段不能重叠。';
      }
    }

    return '';
  };

  const saveTemplateDraft = () => {
    const validationMessage = validateTemplateDraft(templateDraft);
    if (validationMessage) {
      setTemplateValidationError(validationMessage);
      return;
    }

    const normalizedTemplate = {
      ...templateDraft,
      name: templateDraft.name.trim(),
      periods: [...templateDraft.periods].sort(
        (a, b) => parseTimeToMinutes(a.start) - parseTimeToMinutes(b.start)
      ),
    };

    setPeakTemplates((prev) => {
      if (templateModalMode === 'edit') {
        return prev.map((item) => (item.id === normalizedTemplate.id ? normalizedTemplate : item));
      }
      return [...prev, normalizedTemplate];
    });
    setSelectedTemplateId(normalizedTemplate.id);
    closeTemplateModal();
  };

  const getEffectiveTemplateForDay = (month, day) => {
    const dayKey = formatMonthDay(month, day);
    const effectiveDayOverrides = dayAssignEditMode ? dayTemplateDraft : dayTemplateOverrides;
    const effectiveMonthMap = monthAssignEditMode ? monthTemplateDraft : monthTemplateMap;
    const templateId = effectiveDayOverrides[dayKey] || effectiveMonthMap[month] || peakTemplates[0]?.id;
    return peakTemplates.find((item) => item.id === templateId) || peakTemplates[0];
  };

  const updateMonthTemplateDraft = (month, templateId) => {
    setMonthTemplateDraft((prev) => ({
      ...prev,
      [month]: templateId,
    }));
  };

  const updateDayTemplateDraft = (month, day, templateId) => {
    setDayTemplateDraft((prev) => ({
      ...prev,
      [formatMonthDay(month, day)]: templateId,
    }));
  };

  const openBatchApplyModal = () => {
    setBatchApplyTemplateId(batchTemplateId || selectedMonthDraftTemplateId || peakTemplates[0]?.id);
    setBatchApplyDays([]);
    setShowBatchApplyModal(true);
  };

  const toggleBatchApplyDay = (day) => {
    setBatchApplyDays((prev) =>
      prev.includes(day) ? prev.filter((item) => item !== day) : [...prev, day].sort((a, b) => a - b)
    );
  };

  const confirmBatchApplyTemplate = () => {
    if (batchApplyDays.length === 0 || !batchApplyTemplateId) return;
    setBatchTemplateId(batchApplyTemplateId);
    setDayTemplateDraft((prev) => {
      const next = { ...prev };
      batchApplyDays.forEach((day) => {
        next[formatMonthDay(selectedMonth, day)] = batchApplyTemplateId;
      });
      return next;
    });
    setShowBatchApplyModal(false);
  };

  const updateFixedTariffTemplateField = (field, value) => {
    setFixedTariffTemplates((prev) =>
      prev.map((template) =>
        template.id === selectedFixedTariffTemplateId ? { ...template, [field]: value } : template
      )
    );
  };

  const updateFixedTariffPeriod = (periodId, field, value) => {
    setFixedTariffTemplates((prev) =>
      prev.map((template) =>
        template.id === selectedFixedTariffTemplateId
          ? {
              ...template,
              periods: template.periods.map((period) =>
                period.id === periodId ? { ...period, [field]: value } : period
              ),
            }
          : template
      )
    );
  };

  const addFixedTariffPeriod = () => {
    setFixedTariffTemplates((prev) =>
      prev.map((template) =>
        template.id === selectedFixedTariffTemplateId
          ? { ...template, periods: [...template.periods, createTariffPeriod('22:00', '24:00', '谷', '0.3200')] }
          : template
      )
    );
  };

  const removeFixedTariffPeriod = (periodId) => {
    setFixedTariffTemplates((prev) =>
      prev.map((template) =>
        template.id === selectedFixedTariffTemplateId
          ? { ...template, periods: template.periods.filter((period) => period.id !== periodId) }
          : template
      )
    );
  };

  const createFixedTariffTemplate = () => {
    const nextTemplate = {
      id: `fixed-${Date.now()}`,
      name: '新建分时电价模板',
      scopeType: fixedTariffScope,
      periods: [
        createTariffPeriod('00:00', '08:00', '谷', '0.3200'),
        createTariffPeriod('08:00', '22:00', '平', '0.6800'),
        createTariffPeriod('22:00', '24:00', '深谷', '0.2800'),
      ],
    };
    setFixedTariffTemplates((prev) => [...prev, nextTemplate]);
    setSelectedFixedTariffTemplateId(nextTemplate.id);
    setFixedTariffError('');
  };

  const saveFixedTariffTemplate = () => {
    if (!selectedFixedTariffTemplate?.name?.trim()) {
      setFixedTariffError('模板名称必填，长度 1-32。');
      return;
    }
    if (selectedFixedTariffTemplate.name.trim().length > 32) {
      setFixedTariffError('模板名称不能超过 32 个字符。');
      return;
    }
    const validationMessage = validateTimePeriods(selectedFixedTariffTemplate.periods);
    if (validationMessage) {
      setFixedTariffError(validationMessage);
      return;
    }
    const hasNegativePrice = selectedFixedTariffTemplate.periods.some((period) => Number(period.price) < 0);
    if (hasNegativePrice) {
      setFixedTariffError('固定分时电价单价不能小于 0。');
      return;
    }
    setFixedTariffTemplates((prev) =>
      prev.map((template) =>
        template.id === selectedFixedTariffTemplate.id
          ? {
              ...template,
              name: template.name.trim(),
              scopeType: fixedTariffScope,
              periods: [...template.periods].sort((a, b) => parseTimeToMinutes(a.start) - parseTimeToMinutes(b.start)),
            }
          : template
      )
    );
    setFixedTariffSavedAt('刚刚');
    setFixedTariffError('');
  };

  const resetDynamicTariffRows = (granularity) => {
    setDynamicTariffGranularity(granularity);
    setDynamicTariffError('');
  };

  const changeDynamicTariffDate = (dateString) => {
    setSelectedDynamicTariffDate(dateString);
    setDynamicTariffError('');
  };

  const shiftDynamicTariffMonth = (offset) => {
    const next = new Date(selectedDynamicDateParts.year, selectedDynamicDateParts.month - 1 + offset, 1);
    const nextYear = next.getFullYear();
    const nextMonth = next.getMonth() + 1;
    const nextDay = Math.min(selectedDynamicDateParts.day, getDaysInMonth(nextMonth, nextYear));
    changeDynamicTariffDate(formatDateString(nextYear, nextMonth, nextDay));
  };

  const getDynamicRowsForDate = (dateString, granularity = dynamicTariffGranularity) => {
    const storeKey = getDynamicTariffStoreKey(dateString, granularity);
    return dynamicTariffStore[storeKey]?.rows || generateDynamicTariffRows(granularity, dateString);
  };

  const getDynamicAverageForDate = (dateString) => getAveragePriceFromRows(getDynamicRowsForDate(dateString));

  const updateDynamicTariffPrice = (rowId, value) => {
    const currentKey = getDynamicTariffStoreKey(selectedDynamicTariffDate, dynamicTariffGranularity);
    setDynamicTariffRows((prev) => {
      const nextRows = prev.map((row) => (row.id === rowId ? { ...row, price: value } : row));
      setDynamicTariffStore((store) => ({
        ...store,
        [currentKey]: {
          rows: nextRows,
          meta: { ...(store[currentKey]?.meta || dynamicTariffImportMeta), saved: false },
        },
      }));
      return nextRows;
    });
    setDynamicTariffImportMeta((prev) => ({ ...prev, saved: false }));
  };

  const saveDynamicTariffRows = () => {
    if (dynamicTariffRows.length !== Number(dynamicTariffGranularity)) {
      setDynamicTariffError(`当前粒度要求 ${dynamicTariffGranularity} 条数据。`);
      return;
    }
    const validationMessage = validateTimePeriods(dynamicTariffRows, { requireFullDay: true });
    if (validationMessage) {
      setDynamicTariffError(validationMessage);
      return;
    }
    const nextMeta = { ...dynamicTariffImportMeta, importedAt: '刚刚', saved: true };
    const currentKey = getDynamicTariffStoreKey(selectedDynamicTariffDate, dynamicTariffGranularity);
    setDynamicTariffStore((prev) => ({
      ...prev,
      [currentKey]: {
        rows: dynamicTariffRows,
        meta: nextMeta,
      },
    }));
    setDynamicTariffImportMeta(nextMeta);
    setDynamicTariffError('');
  };

  const handleDynamicTariffImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const extension = file.name.split('.').pop()?.toLowerCase();
      const workbook =
        extension === 'csv'
          ? XLSX.read(await file.text(), { type: 'string' })
          : XLSX.read(await file.arrayBuffer(), { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false });
      const importedRows = parseImportedTariffRows(matrix, dynamicTariffGranularity);
      if (importedRows.length !== Number(dynamicTariffGranularity)) {
        throw new Error(`导入数据需要严格匹配 ${dynamicTariffGranularity} 条，当前解析到 ${importedRows.length} 条。`);
      }
      const validationMessage = validateTimePeriods(importedRows, { requireFullDay: true });
      if (validationMessage) throw new Error(validationMessage);
      const nextMeta = {
        fileName: file.name,
        importedAt: '刚刚',
        source: extension === 'csv' ? 'CSV文件导入' : 'Excel文件导入',
        saved: false,
      };
      const currentKey = getDynamicTariffStoreKey(selectedDynamicTariffDate, dynamicTariffGranularity);
      setDynamicTariffRows(importedRows);
      setDynamicTariffStore((prev) => ({
        ...prev,
        [currentKey]: {
          rows: importedRows,
          meta: nextMeta,
        },
      }));
      setDynamicTariffImportMeta(nextMeta);
      setDynamicTariffError('');
    } catch (error) {
      setDynamicTariffError(error.message || '导入失败，请检查文件格式。');
    } finally {
      event.target.value = '';
    }
  };

  const handlePrimaryMenuChange = (menuKey) => {
    setActivePrimaryMenu(menuKey);
    setActiveSecondaryMenu(defaultSecondaryMenuMap[menuKey] || '');
  };

  const renderPlaceholderContent = (primaryKey, secondaryKey = '') => {
    const placeholderMap = {
      微网总览: {
        title: '微网总览',
        description: '展示园区微电网整体运行、并网状态、源网荷储关键指标与站级告警概况。',
        cards: ['并离网状态总览', '源网荷储关键 KPI', '今日收益与电量概览'],
      },
      电气拓扑: {
        title: '电气拓扑',
        description: '面向站级 SCADA 的电气一次系统拓扑、设备联接关系和运行态势展示。',
        cards: ['拓扑图绘制与浏览', '并网点与储能柜关系', '断路器/隔离开关状态'],
      },
      能碳核算分析: {
        title: '能碳核算分析',
        description: '按日电量、清洁能源占比与碳排指标展示核算结果。',
        cards: ['碳减排趋势', '购售电碳因子对比', '站级能碳日报'],
      },
      核算引擎管理: {
        title: '核算引擎管理',
        description: '管理碳核算模型版本、边界条件、因子表与发布状态。',
        cards: ['模型版本管理', '因子表维护', '任务执行状态'],
      },
      遥测: {
        title: '设备监控 / 遥测',
        description: '查看实时测点、趋势、越限值和关键设备运行摘要。',
        cards: ['PCS/BMS 实时量', '并网点功率趋势', '公辅设备环境量'],
      },
      遥控: {
        title: '设备监控 / 遥控',
        description: '对边缘站设备进行安全下发控制，保留权限与二次确认位。',
        cards: ['设备启停控制', '并离网控制', '控制下发记录'],
      },
      遥调: {
        title: '设备监控 / 遥调',
        description: '管理控制参数、功率给定与设备调节量设置。',
        cards: ['PCS 功率设定', '空调温控参数', '站级运行阈值'],
      },
      遥信: {
        title: '设备监控 / 遥信',
        description: '查看遥信、变位记录与状态联锁标记。',
        cards: ['开关量状态', '变位时间轴', '遥信告警联动'],
      },
      电量报表: {
        title: '数据统计 / 电量报表',
        description: '输出充放电量、购售电量、光伏发电量与分时电量报表。',
        cards: ['日电量报表', '月度分时电量', '设备级电量分摊'],
      },
      综合能源报表: {
        title: '数据统计 / 综合能源报表',
        description: '综合展示电、热、冷等能源维度的报表与占比。',
        cards: ['能源结构占比', '综合能耗趋势', '园区用能对比'],
      },
      收益报表: {
        title: '数据统计 / 收益报表',
        description: '查看策略收益、峰谷套利收益和削峰收益构成。',
        cards: ['策略收益归因', '电价套利收益', '负荷响应收益'],
      },
      电芯分析: {
        title: '数据统计 / 电芯分析',
        description: '面向电池簇、电芯一致性和健康度的分析页面。',
        cards: ['SOH/SOC 分布', '温差分析', '异常电芯定位'],
      },
      告警统计: {
        title: '故障告警 / 告警统计',
        description: '查看故障、保护、联锁和环境告警的统计与处置状态。',
        cards: ['告警趋势统计', '未闭环事件', '高频告警 TOP'],
      },
      告警规则: {
        title: '故障告警 / 告警规则',
        description: '维护告警分级、阈值、联动动作与通知规则。',
        cards: ['告警等级策略', '通知规则', '规则启停与审计'],
      },
      算法管理: {
        title: '算法管理',
        description: '管理算法版本、数据验证和模型发布状态。',
        cards: ['算法版本仓', '输入数据校验', '回滚与灰度发布'],
      },
      系统设置: {
        title: '系统管理 / 系统设置',
        description: '站级系统参数、OTA、重启恢复、校时和 EMS 复位。',
        cards: ['OTA 升级', '系统时钟', '恢复出厂与复位'],
      },
      设备管理: {
        title: '系统管理 / 设备管理',
        description: '设备档案、采集策略、采集频率、点表配置和上报规则。',
        cards: ['设备档案', '采集策略', '点表与规则'],
      },
      拓扑配置: {
        title: '系统管理 / 拓扑配置',
        description: '维护站级 SCADA 绘制关系、拓扑分组和映射绑定。',
        cards: ['SCADA 绘图配置', '设备映射', '页面发布'],
      },
      数据调整: {
        title: '系统管理 / 数据调整',
        description: '对历史统计值进行人工修正、数据重算和调整审计。',
        cards: ['历史重算', '手工修正', '调整日志'],
      },
      数据清理: {
        title: '系统管理 / 数据清理',
        description: '清理历史、异常或垃圾数据，并保留清理记录。',
        cards: ['清理策略', '历史归档', '风险校验'],
      },
      口令设置: {
        title: '系统管理 / 口令设置',
        description: '维护二次口令、控制口令与高危操作授权策略。',
        cards: ['口令分级', '高危授权', '口令有效期'],
      },
      数据同步: {
        title: '系统管理 / 数据同步',
        description: '管理云边数据同步、任务状态、失败重试和链路监控。',
        cards: ['同步任务', '链路状态', '失败重试'],
      },
      数据转发: {
        title: '系统管理 / 数据转发',
        description: '配置第三方数据转发、点表映射和转发目标状态。',
        cards: ['转发目标', '点表映射', '转发监控'],
      },
    };

    const key = secondaryKey || primaryKey;
    const item = placeholderMap[key] || {
      title: key || primaryKey,
      description: currentPrimaryMenu.description,
      cards: ['页面结构占位', '后续接口接入', '状态与操作说明'],
    };

    return (
      <GenericFeaturePage
        title={item.title}
        description={item.description}
        cards={item.cards}
      />
    );
  };

  return (
    <div className="min-h-screen bg-[#051210] text-slate-300 font-sans flex overflow-hidden selection:bg-[#00DFA2] selection:text-black">
      {/* Sidebar */}
      <div className="w-64 bg-[#081714] border-r border-[#153B34] flex flex-col justify-between shadow-2xl z-20 shrink-0">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-[#153B34] mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-[#00DFA2] to-[#10B981] rounded-lg flex items-center justify-center mr-3 shadow-[0_0_15px_rgba(0,223,162,0.4)]">
              <Zap size={20} className="text-[#051210]" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-wider">能源管理系统</h1>
              <p className="text-[10px] text-[#00DFA2]">ENERGY MANAGEMENT</p>
            </div>
          </div>
          <nav className="px-4 space-y-1">
            {menuCatalog.map((item, index) => {
              const Icon = item.icon;
              const showDivider = index === 3;
              const isExpanded = item.key !== '策略中心' && activePrimaryMenu === item.key && item.children.length > 0;
              return (
                <React.Fragment key={item.key}>
                  {showDivider && (
                    <div className="pt-4 pb-2">
                      <p className="text-xs text-slate-500 px-3 font-semibold">控制与调度</p>
                    </div>
                  )}
                  <NavItem
                    icon={<Icon size={18} />}
                    label={item.key}
                    badge={item.key === '故障告警' ? '3' : undefined}
                    active={activePrimaryMenu === item.key}
                    onClick={() => handlePrimaryMenuChange(item.key)}
                  />
                  {isExpanded && (
                    <div className="ml-5 mt-1 space-y-1 border-l border-[#153B34] pl-3">
                      {item.children.map((child) => (
                        <button
                          key={child}
                          onClick={() => {
                            setActivePrimaryMenu(item.key);
                            setActiveSecondaryMenu(child);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                            activeSecondaryMenu === child
                              ? 'bg-[#00DFA2]/12 text-[#00DFA2] border border-[#00DFA2]/30'
                              : 'text-slate-400 hover:text-white hover:bg-[#0C221E] border border-transparent'
                          }`}
                        >
                          {child}
                        </button>
                      ))}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-[#153B34]">
          <NavItem icon={<LogOut size={18} />} label="退出登录" className="text-red-400 hover:text-red-300 hover:bg-red-950/30" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Header */}
        <header className="h-14 bg-[#081714]/80 backdrop-blur-md border-b border-[#153B34] flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center text-sm font-medium text-slate-400">
            <span className="flex items-center gap-2 px-3 py-1 bg-[#0C221E] rounded-md border border-[#153B34]">
              <Database size={14} className="text-[#00DFA2]" />
              微网聚合节点 A1 (边缘网关)
            </span>
          </div>

          <div className="flex items-center space-x-6 text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#10B981]/10 text-[#10B981] rounded-full border border-[#10B981]/30">
                <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse"></span>
                云边链路正常
              </span>
              <span className="flex items-center gap-1.5"><UploadCloud size={14} className="text-blue-400"/> 上行: 1.2MB/s</span>
              <span className="flex items-center gap-1.5"><DownloadCloud size={14} className="text-[#00DFA2]"/> 下行同步: 12ms前</span>
            </div>
            <div className="flex flex-col items-end leading-tight">
              <span className="text-sm font-bold text-white">{formatTime(currentTime)}</span>
              <span>{formatDate(currentTime)}</span>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6 relative pb-20">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#00DFA2]/5 rounded-full blur-[120px] pointer-events-none"></div>

          <div className="relative z-10 animate-in fade-in">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-[#0C221E] to-[#081714] border border-[#153B34] rounded-xl shadow-lg">
                  <CurrentPrimaryIcon size={28} className="text-[#00DFA2]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1 tracking-wide">{activePrimaryMenu}</h2>
                  <p className="text-sm text-slate-400">{currentPrimaryMenu.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* ===================== 电价配置模块 ======================= */}
          {/* ========================================================= */}
          {activePrimaryMenu === '系统管理' && activeSecondaryMenu === '费率时段' && (
            <div className="relative z-10 animate-in fade-in slide-in-from-bottom-4">
              <div className="space-y-6">
                <div className="bg-[#0C221E] border border-[#153B34] rounded-xl p-5 shadow-lg">
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <h3 className="text-white font-bold text-base flex items-center gap-2">
                        <ShieldCheck size={17} className="text-[#00DFA2]" />
                        电价模式设置
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">企业侧同一时刻只启用一种电价机制。切换后，电价配置页和策略中心模板曲线都将跟随当前生效模式。</p>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full border text-xs font-bold ${priceMode === 'dynamic' ? 'border-blue-500/30 bg-blue-500/10 text-blue-300' : 'border-[#00DFA2]/30 bg-[#00DFA2]/10 text-[#00DFA2]'}`}>
                      当前生效：{priceMode === 'dynamic' ? '动态市场化分时电价' : '固定分时电价'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-5">
                    <button
                      onClick={() => setPriceMode('fixed')}
                      className={`text-left rounded-xl border p-4 transition-all ${priceMode === 'fixed' ? 'border-[#00DFA2] bg-[#00DFA2]/10 shadow-[0_0_15px_rgba(0,223,162,0.12)]' : 'border-[#153B34] bg-[#081714] hover:border-[#2b6459]'}`}
                    >
                      <div className="text-sm font-bold text-white">固定分时电价</div>
                      <div className="text-[11px] text-slate-500 mt-1">适用于工商业 TOU 场景，按尖/峰/平/谷/深谷维护长期稳定的固定时段与单价。</div>
                    </button>
                    <button
                      onClick={() => setPriceMode('dynamic')}
                      className={`text-left rounded-xl border p-4 transition-all ${priceMode === 'dynamic' ? 'border-blue-400 bg-blue-500/10 shadow-[0_0_15px_rgba(96,165,250,0.12)]' : 'border-[#153B34] bg-[#081714] hover:border-[#2b6459]'}`}
                    >
                      <div className="text-sm font-bold text-white">动态市场化分时电价</div>
                      <div className="text-[11px] text-slate-500 mt-1">适用于现货或日前市场场景，按 48/96 点离散价格维护当日市场电价，仅保留一套生效曲线。</div>
                    </button>
                  </div>
                </div>

                {priceMode === 'fixed' && (
                  <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-3 space-y-4">
                      <div className="bg-[#0C221E] border border-[#153B34] rounded-xl p-4 shadow-lg">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2"><DollarSign size={16} className="text-[#00DFA2]" /> 固定分时电价</h3>
                        <p className="text-[11px] text-slate-500 mt-1">适用于长期稳定的尖峰平谷深谷 TOU 模板。</p>
                        <div className="flex bg-[#081714] p-1 border border-[#153B34] rounded-lg mt-4">
                          <button onClick={() => setFixedTariffScope('monthly')} className={`flex-1 py-1.5 text-xs rounded ${fixedTariffScope === 'monthly' ? 'bg-[#00DFA2] text-[#051210] font-bold' : 'text-slate-400'}`}>按月配置</button>
                          <button onClick={() => setFixedTariffScope('daily')} className={`flex-1 py-1.5 text-xs rounded ${fixedTariffScope === 'daily' ? 'bg-[#00DFA2] text-[#051210] font-bold' : 'text-slate-400'}`}>按日配置</button>
                        </div>
                      </div>

                      <div className="bg-[#0C221E] border border-[#153B34] rounded-xl p-4 shadow-lg">
                        {fixedTariffScope === 'monthly' ? (
                          <>
                            <h4 className="text-white font-bold text-sm mb-3">适用月份</h4>
                            <div className="grid grid-cols-3 gap-2">
                              {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
                                <button key={month} onClick={() => setSelectedFixedTariffMonth(month)} className={`py-2 rounded-lg border text-xs ${selectedFixedTariffMonth === month ? 'border-[#00DFA2] bg-[#00DFA2]/10 text-[#00DFA2] font-bold' : 'border-[#153B34] bg-[#081714] text-slate-500 hover:text-white'}`}>{month}月</button>
                              ))}
                            </div>
                          </>
                        ) : (
                          <>
                            <h4 className="text-white font-bold text-sm mb-3">适用日期</h4>
                            <input type="date" value={selectedFixedTariffDate} onChange={(e) => setSelectedFixedTariffDate(e.target.value)} className="w-full bg-[#081714] border border-[#153B34] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00DFA2]" />
                          </>
                        )}
                        <p className="text-[11px] text-slate-500 mt-4 leading-relaxed">适用范围只影响模板归属，电价时段仍在右侧维护。</p>
                      </div>

                      <div className="bg-[#0C221E] border border-[#153B34] rounded-xl p-4 shadow-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-white font-bold text-sm">模板库</h4>
                          <button onClick={createFixedTariffTemplate} className="text-xs text-[#00DFA2] flex items-center gap-1"><Plus size={13} /> 新建</button>
                        </div>
                        <div className="space-y-2">
                          {fixedTariffTemplates.map((template) => (
                            <button key={template.id} onClick={() => setSelectedFixedTariffTemplateId(template.id)} className={`w-full text-left rounded-lg border p-3 ${selectedFixedTariffTemplateId === template.id ? 'border-[#00DFA2] bg-[#00DFA2]/10' : 'border-[#153B34] bg-[#081714] hover:border-[#2b6459]'}`}>
                              <div className="text-sm text-white font-medium truncate">{template.name}</div>
                              <div className="text-[10px] text-slate-500 mt-1">{template.periods.length} 个时段 / {template.scopeType === 'monthly' ? '按月' : '按日'}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="col-span-9 bg-[#0C221E] border border-[#153B34] rounded-xl overflow-hidden shadow-lg">
                      <div className="px-5 py-4 border-b border-[#153B34] bg-[#081714]/60 flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-bold text-base">TOU 模板编辑区</h3>
                          <p className="text-xs text-slate-500 mt-1">支持尖、峰、平、谷、深谷五档。未覆盖 24h 的空档会在预览中保留空白。</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={addFixedTariffPeriod} className="px-3 py-2 rounded-lg border border-[#153B34] text-xs text-[#00DFA2] hover:text-white flex items-center gap-1"><Plus size={14} /> 新增时段</button>
                          <button onClick={saveFixedTariffTemplate} className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#00DFA2] to-[#10B981] text-[#051210] text-xs font-bold flex items-center gap-1"><Save size={14} /> 保存模板</button>
                        </div>
                      </div>

                      <div className="p-5 space-y-5">
                        <div className="grid grid-cols-12 gap-4">
                          <div className="col-span-7">
                            <label className="block text-xs text-slate-400 mb-1.5">模板名称</label>
                            <input value={selectedFixedTariffTemplate?.name || ''} maxLength={32} onChange={(e) => updateFixedTariffTemplateField('name', e.target.value)} className="w-full bg-[#081714] border border-[#153B34] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00DFA2]" placeholder="1-32个字符" />
                          </div>
                          <MetricLite label="覆盖率" value={fixedTariffCoverageText} tone={fixedTariffCoverageMinutes === 1440 ? 'green' : 'amber'} />
                          <MetricLite label="最后保存" value={fixedTariffSavedAt} />
                        </div>

                        <FixedTariffBandChart periods={selectedFixedTariffTemplate?.periods || []} />

                        <div className="rounded-xl border border-[#153B34] overflow-hidden">
                          <table className="w-full text-xs text-left">
                            <thead className="text-slate-500 bg-[#081714] uppercase">
                              <tr>
                                <th className="px-4 py-3 border-b border-[#153B34]">开始时间</th>
                                <th className="px-4 py-3 border-b border-[#153B34]">结束时间</th>
                                <th className="px-4 py-3 border-b border-[#153B34]">电价类型</th>
                                <th className="px-4 py-3 border-b border-[#153B34]">单价(元/kWh)</th>
                                <th className="px-4 py-3 border-b border-[#153B34] text-right">操作</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#153B34]">
                              {(selectedFixedTariffTemplate?.periods || []).map((period) => (
                                <FixedTariffPeriodRow key={period.id} period={period} onChange={updateFixedTariffPeriod} onRemove={removeFixedTariffPeriod} />
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {fixedTariffError && <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{fixedTariffError}</div>}
                      </div>
                    </div>
                  </div>
                )}

                {priceMode === 'dynamic' && (
                  <div className="bg-[#0C221E] border border-blue-500/30 rounded-xl overflow-hidden shadow-lg">
                    <div className="px-5 py-4 border-b border-blue-500/20 bg-[#081714]/60 flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-white font-bold text-base flex items-center gap-2"><LineChart size={17} className="text-blue-300" /> 动态市场化分时电价</h3>
                        <p className="text-xs text-slate-500 mt-1">支持 48 点/30分钟或 96 点/15分钟日前电价录入。动态电价仅保留原始市场价格，不再映射尖峰平谷等级。</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="px-3 py-2 rounded-lg border border-blue-500/30 bg-blue-500/10 text-xs text-blue-200 cursor-pointer hover:text-white">
                          <UploadCloud size={14} className="inline mr-1" />
                          导入 CSV/Excel
                          <input type="file" accept=".csv,.xlsx,.xls" onChange={handleDynamicTariffImport} className="hidden" />
                        </label>
                        <button onClick={saveDynamicTariffRows} className="px-4 py-2 rounded-lg bg-blue-400 text-[#051210] text-xs font-bold flex items-center gap-1"><Save size={14} /> 保存数据</button>
                      </div>
                    </div>

                    <div className="p-5 space-y-5">
                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-3">
                          <label className="block text-xs text-slate-400 mb-1.5">数据粒度</label>
                          <select value={dynamicTariffGranularity} onChange={(e) => resetDynamicTariffRows(e.target.value)} className="w-full bg-[#081714] border border-[#153B34] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-400">
                            <option value="96">96点 / 15分钟</option>
                            <option value="48">48点 / 30分钟</option>
                          </select>
                        </div>
                        <div className="col-span-3">
                          <label className="block text-xs text-slate-400 mb-1.5">目标日期</label>
                          <input type="date" value={selectedDynamicTariffDate} onChange={(e) => changeDynamicTariffDate(e.target.value)} className="w-full bg-[#081714] border border-[#153B34] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-400" />
                        </div>
                        <div className="col-span-3 rounded-xl border border-[#153B34] bg-[#081714] px-4 py-3">
                          <div className="text-xs text-slate-500">平均电价</div>
                          <div className="text-lg text-white font-bold mt-1">{dynamicAveragePrice.toFixed(4)} 元/kWh</div>
                        </div>
                        <div className="col-span-3 rounded-xl border border-[#153B34] bg-[#081714] px-4 py-3">
                          <div className="text-xs text-slate-500">当前机制</div>
                          <div className="text-lg text-blue-300 font-bold mt-1">动态市场化</div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-[#153B34] bg-[#081714] p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="text-sm font-bold text-white">按日历查看日电价</div>
                            <div className="text-[11px] text-slate-500 mt-1">动态市场化电价按“每日一条价格曲线”管理。点击日历日期即可切换到该日的 48/96 点价格数据。</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => shiftDynamicTariffMonth(-1)} className="px-3 py-1.5 rounded-lg border border-[#153B34] text-xs text-slate-300 hover:text-white">上月</button>
                            <div className="px-3 py-1.5 rounded-lg border border-blue-500/20 bg-blue-500/10 text-xs text-blue-300 font-bold">{dynamicMonthLabel}</div>
                            <button onClick={() => shiftDynamicTariffMonth(1)} className="px-3 py-1.5 rounded-lg border border-[#153B34] text-xs text-slate-300 hover:text-white">下月</button>
                          </div>
                        </div>
                        <div className="grid grid-cols-7 gap-2 mb-2">
                          {weekDayLabels.map((label, index) => (
                            <div key={`dynamic-week-${label}`} className={`text-center text-[11px] font-bold py-2 rounded-lg border border-[#153B34] bg-[#0C221E] ${index >= 5 ? 'text-amber-300' : 'text-slate-400'}`}>
                              {label}
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                          {dynamicCalendarCells.map((cell) => {
                            if (cell.type === 'empty') {
                              return <div key={cell.id} className="min-h-[92px] rounded-xl border border-[#153B34]/40 bg-[#0C221E]/30"></div>;
                            }
                            const dateValue = formatDateString(selectedDynamicDateParts.year, selectedDynamicDateParts.month, cell.day);
                            const isActive = dateValue === selectedDynamicTariffDate;
                            const holidayLabel = getHolidayLabel(selectedDynamicDateParts.month, cell.day);
                            const avgPrice = getDynamicAverageForDate(dateValue);
                            return (
                              <button
                                key={cell.id}
                                onClick={() => changeDynamicTariffDate(dateValue)}
                                className={`min-h-[92px] rounded-xl border p-2 text-left transition-all ${isActive ? 'border-blue-400 bg-blue-500/10 shadow-[0_0_12px_rgba(96,165,250,0.12)]' : 'border-[#153B34] bg-[#0C221E] hover:border-[#365f74]'}`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <span className="text-sm font-bold text-white">{String(cell.day).padStart(2, '0')}</span>
                                  {isActive && <span className="px-1.5 py-0.5 rounded-full text-[10px] border border-blue-500/30 bg-blue-500/10 text-blue-300">当前</span>}
                                </div>
                                <div className="mt-2 min-h-[18px]">
                                  {holidayLabel && (
                                    <span className="px-1.5 py-0.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-300 text-[10px]">
                                      {holidayLabel}
                                    </span>
                                  )}
                                </div>
                                <div className="mt-3">
                                  <div className="text-[10px] text-slate-500">平均电价</div>
                                  <div className="text-sm font-bold text-white mt-1">{avgPrice.toFixed(4)} 元/kWh</div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-12 gap-5">
                        <div className="col-span-7 rounded-xl border border-[#153B34] bg-[#081714] overflow-hidden">
                          <div className="px-4 py-3 border-b border-[#153B34] flex items-center justify-between">
                            <div className="text-sm font-bold text-white">价格数据表格</div>
                            <div className="text-[11px] text-slate-500">{dynamicTariffRows.length} / {dynamicTariffGranularity} 条</div>
                          </div>
                          <div className="max-h-[560px] overflow-auto">
                            <table className="w-full text-xs text-left">
                              <thead className="sticky top-0 z-10 bg-[#0C221E] text-slate-500 uppercase">
                                <tr>
                                  <th className="px-3 py-2 border-b border-[#153B34]">序号</th>
                                  <th className="px-3 py-2 border-b border-[#153B34]">开始</th>
                                  <th className="px-3 py-2 border-b border-[#153B34]">结束</th>
                                  <th className="px-3 py-2 border-b border-[#153B34]">市场电价</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#153B34]">
                                {dynamicTariffRows.map((row, index) => (
                                  <DynamicTariffRow key={row.id} row={row} index={index} onChangePrice={updateDynamicTariffPrice} />
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <div className="col-span-5 space-y-4">
                          <DynamicTariffChart rows={dynamicTariffRows} />
                          <div className="rounded-xl border border-[#153B34] bg-[#081714] p-4">
                            <div className="text-sm font-bold text-white mb-3">导入与保存状态</div>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <StatusCell label="最后导入" value={dynamicTariffImportMeta.importedAt} />
                              <StatusCell label="数据来源" value={dynamicTariffImportMeta.source} />
                              <StatusCell label="当前粒度" value={dynamicTariffGranularity === '96' ? '96点/15分钟' : '48点/30分钟'} />
                              <StatusCell label="保存状态" value={dynamicTariffImportMeta.saved ? '已保存' : '未保存'} tone={dynamicTariffImportMeta.saved ? 'green' : 'amber'} />
                            </div>
                            <div className="text-[11px] text-slate-500 mt-3 truncate">文件：{dynamicTariffImportMeta.fileName}</div>
                          </div>
                          {dynamicTariffError && <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{dynamicTariffError}</div>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* ===================== 策略中心模块 ======================= */}
          {/* ========================================================= */}
          {activePrimaryMenu === '策略中心' && (
            <>
              <div className="relative z-10 min-h-[500px]">
                <div className="flex space-x-1 bg-[#0C221E] p-1 rounded-lg border border-[#153B34] inline-flex mb-6">
                  <TabButton
                    active={activeStrategyTab === '模式切换'}
                    onClick={() => setActiveStrategyTab('模式切换')}
                    icon={<Radio size={16} />}
                    label="模式切换"
                  />
                  <TabButton
                    active={activeStrategyTab === '策略监控'}
                    onClick={() => setActiveStrategyTab('策略监控')}
                    icon={<Activity size={16} />}
                    label="策略监控"
                  />
                  <TabButton
                    active={activeStrategyTab === '硬性约束'}
                    onClick={() => setActiveStrategyTab('硬性约束')}
                    icon={<ShieldCheck size={16} />}
                    label="硬性约束"
                  />
                  <TabButton
                    active={activeStrategyTab === '动环策略配置'}
                    onClick={() => setActiveStrategyTab('动环策略配置')}
                    icon={<Wrench size={16} />}
                    label="动环策略配置"
                  />
                  <TabButton
                    active={activeStrategyTab === '智能策略'}
                    onClick={() => setActiveStrategyTab('智能策略')}
                    icon={<Cpu size={16} />}
                    label="智能策略"
                  />
                </div>

                {activeStrategyTab === '模式切换' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="grid grid-cols-3 gap-4">
                      {/* 模式 1: 孤立/断网模式 */}
                      <div onClick={() => setControlMode('local')} className={`relative overflow-hidden cursor-pointer rounded-2xl transition-all border-2 p-6 flex flex-col items-center text-center ${controlMode === 'local' ? 'bg-gradient-to-br from-[#10B981]/20 to-[#0C221E] border-[#00DFA2] shadow-[0_0_20px_rgba(0,223,162,0.15)]' : 'bg-[#081714] border-[#153B34] hover:border-[#153B34]/80 opacity-60'}`}>
                        {controlMode === 'local' && <div className="absolute top-3 right-3 text-[#00DFA2]"><CheckCircle2 size={24} /></div>}
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-colors ${controlMode === 'local' ? 'bg-[#00DFA2]/20 text-[#00DFA2]' : 'bg-[#153B34] text-slate-400'}`}><ZapOff size={28} /></div>
                        <h4 className={`text-lg font-bold mb-2 ${controlMode === 'local' ? 'text-white' : 'text-slate-300'}`}>孤立/断网模式</h4>
                        <p className="text-xs text-slate-400 mb-4 h-12">拒绝任何外部指令。仅依靠边缘侧本地保存的最后一次策略独立运行。</p>
                      </div>

                      {/* 模式 2: 云边协同模式 */}
                      <div onClick={() => setControlMode('cloud_edge')} className={`relative overflow-hidden cursor-pointer rounded-2xl transition-all border-2 p-6 flex flex-col items-center text-center ${controlMode === 'cloud_edge' ? 'bg-gradient-to-br from-[#10B981]/20 to-[#0C221E] border-[#00DFA2] shadow-[0_0_20px_rgba(0,223,162,0.15)]' : 'bg-[#081714] border-[#153B34] hover:border-[#153B34]/80 opacity-60'}`}>
                        {controlMode === 'cloud_edge' && <div className="absolute top-3 right-3 text-[#00DFA2]"><CheckCircle2 size={24} /></div>}
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-colors ${controlMode === 'cloud_edge' ? 'bg-[#00DFA2]/20 text-[#00DFA2]' : 'bg-[#153B34] text-slate-400'}`}><RefreshCw size={28} /></div>
                        <h4 className={`text-lg font-bold mb-2 ${controlMode === 'cloud_edge' ? 'text-white' : 'text-slate-300'}`}>云边协同模式 (当前)</h4>
                        <p className="text-xs text-slate-400 mb-4 h-12">接收云端的大气象数据和预测模型权重更新，在边缘侧进行高精度的 L3 智能寻优。</p>
                      </div>

                      {/* 模式 3: 远方模式 */}
                      <div onClick={() => setControlMode('remote')} className={`relative overflow-hidden cursor-pointer rounded-2xl transition-all border-2 p-6 flex flex-col items-center text-center ${controlMode === 'remote' ? 'bg-gradient-to-br from-[#3B82F6]/20 to-[#0C221E] border-[#3B82F6] shadow-[0_0_20px_rgba(59,130,246,0.15)]' : 'bg-[#081714] border-[#153B34] hover:border-[#153B34]/80 opacity-60'}`}>
                        {controlMode === 'remote' && <div className="absolute top-3 right-3 text-[#3B82F6]"><CheckCircle2 size={24} /></div>}
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-colors ${controlMode === 'remote' ? 'bg-[#3B82F6]/20 text-[#3B82F6]' : 'bg-[#153B34] text-slate-400'}`}><Radio size={28} /></div>
                        <h4 className={`text-lg font-bold mb-2 ${controlMode === 'remote' ? 'text-white' : 'text-slate-300'}`}>远方模式 (上级调度)</h4>
                        <p className="text-xs text-slate-400 mb-4 h-12">边缘智能挂起。强制执行上级电网或虚拟电厂(VPP)下发的绝对功率指令。</p>
                      </div>
                    </div>
                    <GridSwitchControl
                      config={gridSwitchConfig}
                      onChangeTopology={updateGridSwitchTopology}
                      onRequestSwitch={openGridSwitchModal}
                    />
                  </div>
                )}

                {activeStrategyTab === '策略监控' && (
                  <StrategyMonitorPage
                    items={strategyMonitorItems}
                    selectedId={selectedMonitorStrategyId}
                    onSelect={setSelectedMonitorStrategyId}
                  />
                )}

                {activeStrategyTab === '硬性约束' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="grid grid-cols-2 gap-6">
                      <L1CompactCard
                        title="防逆功率保护"
                        subtitle="参考现场保护页的精简配置，只保留限制值、目标值和保护程度。"
                        icon={<ZapOff size={20} className="text-red-400" />}
                        accent="red"
                        config={antiBackflowConfig}
                        onToggle={toggleAntiBackflow}
                        onOpen={openAntiBackflowModal}
                        summaryItems={[
                          { label: '限制值', value: `${antiBackflowConfig.limitValue} kW` },
                          { label: '目标值', value: `${antiBackflowConfig.targetValue} kW` },
                          { label: '保护程度', value: antiBackflowConfig.protectionLevel },
                        ]}
                      />
                      <L1CompactCard
                        title="需量控制"
                        subtitle="按申报需量协调储能和充电桩负荷，降低超需量风险。"
                        icon={<Activity size={20} className="text-[#00DFA2]" />}
                        accent="green"
                        config={demandControlConfig}
                        onToggle={toggleDemandControl}
                        onOpen={openDemandControlModal}
                        summaryItems={[
                          { label: '限制值', value: `${demandControlConfig.limitValue} kW` },
                          { label: '目标值', value: `${demandControlConfig.targetValue} kW` },
                          { label: '储能控制', value: demandControlConfig.protectionLevel },
                          {
                            label: '有序充电',
                            value: demandControlConfig.chargerControlEnabled
                              ? `启用 / ${demandControlConfig.chargerControlMode}`
                              : '关闭',
                          },
                        ]}
                      />
                    </div>
                    <div className="bg-[#0C221E] border border-[#153B34] rounded-xl p-4 shadow-lg">
                      <div className="flex items-center gap-2 text-sm font-bold text-white mb-2">
                        <ShieldCheck size={16} className="text-[#00DFA2]" />
                        硬性约束说明
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        当前页面承接 L1 防逆流与需量控制。两项策略继续使用独立配置弹窗，避免误操作并保留现场常用参数。
                      </p>
                      <div className="mt-4 text-[11px] text-slate-500">
                        削峰填谷、智能经济调度和绿电消纳优先统一放在 `智能策略` 页签中管理。
                      </div>
                    </div>
                  </div>
                )}

                {activeStrategyTab === '动环策略配置' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="grid grid-cols-4 gap-4">
                      <MetricCard title="DI输入点位" value={String(diCount)} hint="按采集器隔离管理" tone="green" />
                      <MetricCard title="DO输出点位" value={String(doCount)} hint="支持联动与控制输出" tone="blue" />
                      <MetricCard title="联动策略" value={String(envStrategies.length)} hint="支持多条件多动作" tone="amber" />
                      <MetricCard title="已关联采集器" value={String(collectorDevices.length)} hint="设备切换仅在点位配置页" tone="red" />
                    </div>

                    <div className="flex space-x-1 bg-[#0C221E] p-1 rounded-lg border border-[#153B34] inline-flex">
                      <TabButton
                        active={envConfigSubtab === 'signals'}
                        onClick={() => setEnvConfigSubtab('signals')}
                        icon={<Database size={16} />}
                        label="DI/DO点位配置"
                      />
                      <TabButton
                        active={envConfigSubtab === 'strategies'}
                        onClick={() => setEnvConfigSubtab('strategies')}
                        icon={<Wrench size={16} />}
                        label="动环策略配置"
                      />
                    </div>

                    {envConfigSubtab === 'signals' && (
                      <div className="space-y-6">
                        <CollectorHeader
                          items={collectorDevices}
                          selectedCollectorId={selectedCollectorId}
                          onSelect={setSelectedCollectorId}
                          onOpenModal={openCollectorModal}
                        />
                        <div className="bg-[#0C221E] border border-[#153B34] rounded-xl overflow-hidden shadow-lg">
                          <div className="p-4 border-b border-[#153B34] flex items-start justify-between bg-[#081714]/60">
                            <div>
                              <h4 className="text-white font-bold text-base flex items-center gap-2">
                                <Database size={18} className="text-[#00DFA2]" />
                                DI/DO点位配置
                              </h4>
                              <p className="text-xs text-slate-400 mt-1">
                                当前页面仅用于给物模型点位命名。切换采集设备后，可对该设备下的 DI/DO 业务名称进行整页编辑与保存。
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              {!signalsEditMode ? (
                                <button
                                  onClick={startSignalsEdit}
                                  className="flex items-center gap-2 px-4 py-2 bg-[#153B34] text-slate-200 font-medium rounded-lg hover:bg-[#1b4a40] transition-all text-sm"
                                >
                                  <Edit3 size={16} />
                                  编辑
                                </button>
                              ) : (
                                <>
                                  <button
                                    onClick={cancelSignalsEdit}
                                    className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
                                  >
                                    取消
                                  </button>
                                  <button
                                    onClick={saveSignalsEdit}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00DFA2] to-[#10B981] text-[#051210] font-bold rounded-lg hover:brightness-110 transition-all text-sm"
                                  >
                                    <Save size={16} />
                                    保存
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="p-4 space-y-6">
                            <SignalConfigPanel
                              title="DI 信号配置"
                              icon={<AlertTriangle size={16} className="text-[#00DFA2]" />}
                              description="来自现场干接点输入，仅支持维护业务名称。未使用点位建议命名为“预留”。"
                              items={diSignals}
                              selectedCollector={selectedCollector}
                              editMode={signalsEditMode}
                              onChange={updateSignalPoint}
                            />
                            <SignalConfigPanel
                              title="DO 信号配置"
                              icon={<Bell size={16} className="text-blue-400" />}
                              description="来自采集设备的输出控制通道，仅支持维护业务名称，策略动作中将引用这里的命名结果。"
                              items={doSignals}
                              selectedCollector={selectedCollector}
                              editMode={signalsEditMode}
                              onChange={updateSignalPoint}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {envConfigSubtab === 'strategies' && (
                      <div className="bg-[#0C221E] border border-[#153B34] rounded-xl overflow-hidden shadow-lg">
                        <div className="p-4 border-b border-[#153B34] flex items-start justify-between bg-[#081714]/60">
                          <div>
                            <h4 className="text-white font-bold text-base flex items-center gap-2">
                              <Wrench size={18} className="text-amber-400" />
                              动环策略配置
                            </h4>
                            <p className="text-xs text-slate-400 mt-1">
                              策略页不再按采集器切换。条件和设备动作通过“设备下拉 + 点位选择弹窗”完成，支持多条件、多动作和执行顺序调整。
                            </p>
                          </div>
                          <button
                            onClick={() => openStrategyModal('create')}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00DFA2] to-[#10B981] text-[#051210] font-bold rounded-lg hover:brightness-110 transition-all text-sm"
                          >
                            <Plus size={16} />
                            新增动环策略
                          </button>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[1520px] text-xs text-left">
                            <thead className="bg-[#081714] text-slate-400 uppercase">
                              <tr>
                                <th className="px-4 py-3 border-b border-[#153B34]">使能</th>
                                <th className="px-4 py-3 border-b border-[#153B34]">策略名称</th>
                                <th className="px-4 py-3 border-b border-[#153B34]">策略编码</th>
                                <th className="px-4 py-3 border-b border-[#153B34]">判断条件摘要</th>
                                <th className="px-4 py-3 border-b border-[#153B34]">执行动作摘要</th>
                                <th className="px-4 py-3 border-b border-[#153B34]">平台动作</th>
                                <th className="px-4 py-3 border-b border-[#153B34]">优先级</th>
                                <th className="px-4 py-3 border-b border-[#153B34]">说明</th>
                                <th className="px-4 py-3 border-b border-[#153B34] text-right">操作</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#153B34] bg-[#0B1E1A]">
                              {envStrategies.map((item) => (
                                <EnvStrategyRow
                                  key={item.id}
                                  item={item}
                                  devices={strategyDevices}
                                  onEdit={() => openStrategyModal('edit', item)}
                                  onToggleEnabled={toggleStrategyEnabled}
                                  onDuplicate={duplicateStrategy}
                                />
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeStrategyTab === '智能策略' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    {/* L3 策略选择 */}
                    <div className="bg-[#0C221E] border border-[#153B34] rounded-xl p-6 shadow-lg">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h4 className="text-white font-bold text-lg flex items-center gap-2"><Cpu size={20} className="text-[#00DFA2]"/> 智能策略引擎</h4>
                          <p className="text-xs text-slate-400 mt-1">同一时间只运行一个智能策略，下方 Tab 仅用于查看和配置。</p>
                        </div>
                      </div>

                      <div className="rounded-xl border border-[#00DFA2]/30 bg-[#00DFA2]/10 px-4 py-3 flex items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-[#00DFA2] font-bold">当前运行策略</span>
                            <span className="px-2 py-0.5 rounded-full border border-[#00DFA2]/30 bg-[#00DFA2]/10 text-[#00DFA2] text-[10px]">运行中</span>
                          </div>
                          <div className="text-lg font-bold text-white mt-1">{activeStrategyMeta.label}</div>
                          <div className="text-xs text-slate-400 mt-1">{activeStrategyMeta.description}</div>
                        </div>
                        <button
                          onClick={() => openL3SwitchModal(l3Strategy)}
                          className="shrink-0 px-4 py-2 rounded-lg bg-[#00DFA2] text-[#051210] text-xs font-bold"
                        >
                          切换策略
                        </button>
                      </div>

                      <div className="mt-5 rounded-lg border border-[#153B34] bg-[#081714] p-1 flex gap-1">
                        {Object.entries(l3StrategyMeta).map(([key, item]) => {
                          const isSelected = selectedL3StrategyTab === key;
                          const isActive = l3Strategy === key;
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setSelectedL3StrategyTab(key)}
                              className={`flex-1 px-4 py-2.5 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                                isSelected ? 'bg-[#0C221E] text-white shadow-inner' : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              {item.label}
                              {isActive && <span className="px-1.5 py-0.5 rounded border border-[#00DFA2]/30 bg-[#00DFA2]/10 text-[#00DFA2] text-[10px]">运行中</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* L3: 削峰填谷详情 */}
                    {selectedL3StrategyTab === 'peak_shaving' && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="bg-[#0C221E] border border-[#153B34] rounded-xl overflow-hidden shadow-lg">
                          <div className="px-5 py-4 border-b border-[#153B34] bg-[#081714]/60 flex items-start justify-between gap-4">
                            <div>
                              <h4 className="text-white font-bold text-base flex items-center gap-2">
                                <CalendarDays size={18} className="text-[#00DFA2]" />
                                策略分配区
                              </h4>
                              <p className="text-xs text-slate-400 mt-1">
                                高频查看与调整区：先确认月份默认模板，再对特殊日期做覆盖。日期覆盖只影响应用关系，不改变下方模板工作区主预览。
                              </p>
                            </div>
                          </div>

                          <div className="p-5 space-y-5">
                            <div className="rounded-xl border border-[#153B34] bg-[#081714] p-4">
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <div className="text-sm font-bold text-white">月份模板分配</div>
                                  <div className="text-[11px] text-slate-400 mt-1">每个月可直接切换默认模板。切换后会清除该月日覆盖，使当月所有日期继承新的月默认模板。</div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {!monthAssignEditMode ? (
                                    <button
                                      onClick={startMonthAssignEdit}
                                      className="px-3 py-1.5 text-xs rounded-lg border border-[#153B34] text-slate-300 hover:text-white"
                                    >
                                      编辑
                                    </button>
                                  ) : (
                                    <>
                                      <button
                                        onClick={cancelMonthTemplateDraft}
                                        className="px-3 py-1.5 text-xs rounded-lg border border-[#153B34] text-slate-300 hover:text-white"
                                      >
                                        取消
                                      </button>
                                      <button
                                        onClick={saveMonthTemplateDraft}
                                        className="px-3 py-1.5 text-xs rounded-lg bg-gradient-to-r from-[#00DFA2] to-[#10B981] text-[#051210] font-bold hover:brightness-110"
                                      >
                                        保存
                                      </button>
                                    </>
                                  )}
                                  <span className="px-2 py-1 rounded-full border border-[#00DFA2]/30 bg-[#00DFA2]/10 text-[#00DFA2] text-[10px]">
                                    当前月份 {selectedMonth} 月
                                  </span>
                                </div>
                              </div>
                              <div className="grid grid-cols-4 gap-3">
                                {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => {
                                  const monthTemplateId = monthTemplateDraft[month] || peakTemplates[0]?.id;
                                  const monthTemplate = peakTemplates.find((item) => item.id === monthTemplateId);
                                  return (
                                    <div
                                      key={month}
                                      onClick={() => {
                                        setSelectedMonth(month);
                                      }}
                                      className={`text-left rounded-xl border p-3 transition-all cursor-pointer ${
                                        selectedMonth === month
                                          ? 'border-[#00DFA2] bg-[#00DFA2]/10 shadow-[0_0_15px_rgba(0,223,162,0.15)]'
                                          : 'border-[#153B34] bg-[#0C221E] hover:border-[#2b6459]'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between gap-2 mb-2">
                                        <div className="text-sm font-bold text-white">{month}月</div>
                                        <span className="text-[10px] text-slate-500">{monthTemplate?.periods?.length || 0} 段</span>
                                      </div>
                                      <select
                                        value={monthTemplateId}
                                        onClick={(event) => event.stopPropagation()}
                                        onChange={(event) => updateMonthTemplateDraft(month, event.target.value)}
                                        disabled={!monthAssignEditMode}
                                        className={`w-full bg-[#081714] border border-[#153B34] rounded-lg px-2 py-2 text-[11px] text-slate-200 focus:outline-none focus:border-[#00DFA2] ${!monthAssignEditMode ? 'opacity-70 cursor-default' : ''}`}
                                      >
                                        {peakTemplates.map((template) => (
                                          <option key={template.id} value={template.id}>{template.name}</option>
                                        ))}
                                      </select>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="rounded-xl border border-[#153B34] bg-[#081714] p-4">
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <div className="text-sm font-bold text-white">{selectedMonth} 月日覆盖配置</div>
                                  <div className="text-[11px] text-slate-400 mt-1">按真实日历展示，节假日仅做本地演示标注。仅在编辑态下允许修改日覆盖。</div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {!dayAssignEditMode ? (
                                    <button
                                      onClick={startDayAssignEdit}
                                      className="px-3 py-1.5 text-xs rounded-lg border border-[#153B34] text-slate-300 hover:text-white"
                                    >
                                      编辑
                                    </button>
                                  ) : (
                                    <>
                                      <button
                                        onClick={openBatchApplyModal}
                                        className="px-3 py-1.5 text-xs rounded-lg bg-gradient-to-r from-[#00DFA2] to-[#10B981] text-[#051210] font-bold hover:brightness-110"
                                      >
                                        批量复用模板
                                      </button>
                                      <button
                                        onClick={cancelDayTemplateDraft}
                                        className="px-3 py-1.5 text-xs rounded-lg border border-[#153B34] text-slate-300 hover:text-white"
                                      >
                                        取消
                                      </button>
                                      <button
                                        onClick={saveDayTemplateDraft}
                                        className="px-3 py-1.5 text-xs rounded-lg bg-gradient-to-r from-[#00DFA2] to-[#10B981] text-[#051210] font-bold hover:brightness-110"
                                      >
                                        保存
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>

                              <div className="grid grid-cols-7 gap-2 mb-2">
                                {weekDayLabels.map((label, index) => (
                                  <div key={label} className={`text-center text-[11px] font-bold py-2 rounded-lg border border-[#153B34] bg-[#0C221E] ${index >= 5 ? 'text-amber-300' : 'text-slate-400'}`}>
                                    {label}
                                  </div>
                                ))}
                              </div>

                              <div className="grid grid-cols-7 gap-2">
                                {selectedMonthCalendarCells.map((cell) => {
                                  if (cell.type === 'empty') {
                                    return <div key={cell.id} className="min-h-[138px] rounded-xl border border-[#153B34]/40 bg-[#0C221E]/30"></div>;
                                  }
                                  const day = cell.day;
                                  const dayKey = formatMonthDay(selectedMonth, day);
                                  const overrideTemplate = peakTemplates.find((item) => item.id === dayTemplateDraft[dayKey]);
                                  const effectiveTemplate = overrideTemplate || selectedMonthDraftTemplate;
                                  const holidayLabel = getHolidayLabel(selectedMonth, day);
                                  const isOverride = Boolean(overrideTemplate);
                                  return (
                                    <div
                                      key={cell.id}
                                      className={`rounded-xl border p-2 text-left transition-all ${
                                        isOverride
                                          ? 'border-amber-500/40 bg-amber-500/10 hover:border-amber-400/60'
                                          : 'border-[#153B34] bg-[#0C221E] hover:border-[#2b6459]'
                                      }`}
                                    >
                                      <div className="flex items-start justify-between gap-2 mb-2">
                                        <label className="flex items-center gap-2">
                                          <span className="text-sm font-bold text-white">{String(day).padStart(2, '0')}</span>
                                        </label>
                                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] border ${
                                          isOverride
                                            ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                                            : 'border-blue-500/30 bg-blue-500/10 text-blue-300'
                                        }`}>
                                          {isOverride ? '覆盖' : '默认'}
                                        </span>
                                      </div>
                                      <div className="min-h-[18px] mb-2">
                                        {holidayLabel && (
                                          <span className="px-1.5 py-0.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-300 text-[10px]">
                                            {holidayLabel}
                                          </span>
                                        )}
                                      </div>
                                      <select
                                        value={effectiveTemplate?.id || ''}
                                        onChange={(event) => updateDayTemplateDraft(selectedMonth, day, event.target.value)}
                                        disabled={!dayAssignEditMode}
                                        className={`w-full bg-[#081714] border border-[#153B34] rounded-lg px-2 py-1.5 text-[10px] text-slate-200 focus:outline-none focus:border-[#00DFA2] ${!dayAssignEditMode ? 'opacity-70 cursor-default' : ''}`}
                                      >
                                        {peakTemplates.map((template) => (
                                          <option key={template.id} value={template.id}>{template.name}</option>
                                        ))}
                                      </select>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-[#0C221E] border border-[#153B34] rounded-xl overflow-hidden shadow-lg">
                          <div className="px-5 py-4 border-b border-[#153B34] bg-[#081714]/60 flex items-start justify-between gap-4">
                            <div>
                              <h4 className="text-white font-bold text-base flex items-center gap-2">
                                <Clock size={18} className="text-[#00DFA2]" />
                                模板工作区
                              </h4>
                              <p className="text-xs text-slate-400 mt-1">
                                低频配置区：定义模板的充放电时段、功率和曲线。主预览始终跟随当前选中的模板。
                              </p>
                            </div>
                            <button
                              onClick={() => openTemplateModal('create')}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-[#00DFA2] to-[#10B981] text-[#051210] text-xs font-bold hover:brightness-110 transition-all shrink-0"
                            >
                              <Plus size={14} />
                              新建模板
                            </button>
                          </div>

                          <div className="grid grid-cols-12">
                            <div className="col-span-4 border-r border-[#153B34] bg-[#091A17]">
                              <div className="px-5 py-4 border-b border-[#153B34]">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">充放电模板列表</div>
                                <div className="text-[11px] text-slate-500 mt-1">选择模板后，右侧立即显示对应曲线与时段明细。</div>
                              </div>
                              <div className="p-4 space-y-3">
                                {peakTemplates.map((template) => {
                                  const stats = getPeakTemplateStats(template);
                                  return (
                                    <PeakTemplateCard
                                      key={template.id}
                                      template={template}
                                      active={template.id === selectedTemplateId}
                                      stats={stats}
                                      onSelect={() => setSelectedTemplateId(template.id)}
                                      onEdit={() => openTemplateModal('edit', template)}
                                      onCopy={() => openTemplateModal('copy', template)}
                                    />
                                  );
                                })}
                              </div>
                            </div>

                            <div className="col-span-8 bg-[#0B1E1A]">
                              <div className="px-5 py-4 border-b border-[#153B34] bg-[#081714]/50 flex items-start justify-between gap-4">
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2 py-1 rounded-full text-[10px] border border-[#00DFA2]/30 bg-[#00DFA2]/10 text-[#00DFA2]">
                                      当前选中模板
                                    </span>
                                    <span className="px-2 py-1 rounded-full text-[10px] border border-blue-500/30 bg-blue-500/10 text-blue-300">
                                      预览跟随模板
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-[10px] border ${priceMode === 'dynamic' ? 'border-blue-500/30 bg-blue-500/10 text-blue-300' : 'border-[#00DFA2]/30 bg-[#00DFA2]/10 text-[#00DFA2]'}`}>
                                      电价模式：{priceMode === 'dynamic' ? '动态市场化' : '固定分时'}
                                    </span>
                                  </div>
                                  <h4 className="text-lg font-bold text-white">{selectedPeakTemplate?.name}</h4>
                                  <p className="text-xs text-slate-400 mt-1">
                                    策略分配区只决定模板应用到哪些日期，不会接管这里的模板曲线预览。
                                  </p>
                                </div>
                                <div className="grid grid-cols-3 gap-3 min-w-[280px]">
                                  <MetricLite label="时段数" value={String(getPeakTemplateStats(selectedPeakTemplate).total)} />
                                  <MetricLite label="充电段" value={String(getPeakTemplateStats(selectedPeakTemplate).charge)} tone="green" />
                                  <MetricLite label="放电段" value={String(getPeakTemplateStats(selectedPeakTemplate).discharge)} tone="amber" />
                                </div>
                              </div>

                              <div className="p-5 space-y-4">
                                <div className="rounded-xl border border-[#153B34] bg-[#081714] p-4">
                                  <div className="flex items-center justify-between mb-4">
                                    <div>
                                      <div className="text-sm font-bold text-white flex items-center gap-2">
                                        <LineChart size={16} className="text-[#00DFA2]" />
                                        模板曲线预览
                                      </div>
                                      <div className="text-[11px] text-slate-400 mt-1">
                                        当前展示 {previewTemplate?.name} 的 24h 功率折线，背景电价始终跟随当前生效电价模式。
                                      </div>
                                    </div>
                                    <div className="flex gap-3 text-[11px] text-slate-400">
                                      <span>充电 {previewTemplateSummary.chargeHours}h</span>
                                      <span>放电 {previewTemplateSummary.dischargeHours}h</span>
                                    </div>
                                  </div>
                                  <PeakStrategyChart
                                    periods={previewTemplate?.periods || []}
                                    priceBands={peakTariffBands}
                                    tariffMode={priceMode}
                                    fixedTariffPeriods={selectedFixedTariffTemplate?.periods || []}
                                    dynamicTariffRows={dynamicTariffRows}
                                    dynamicTariffGranularity={dynamicTariffGranularity}
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div className="rounded-xl border border-[#153B34] bg-[#081714] overflow-hidden">
                                    <div className="px-4 py-3 border-b border-[#153B34] text-sm font-bold text-white">模板时段明细</div>
                                    <div className="divide-y divide-[#153B34]">
                                      {(previewTemplate?.periods || []).map((period) => (
                                        <div key={period.id} className="px-4 py-3 flex items-center justify-between text-sm">
                                          <div>
                                            <div className="text-white font-medium">{period.start} - {period.end}</div>
                                            <div className="text-[11px] text-slate-500">{Number(period.power) > 0 ? '充电' : '放电'}</div>
                                          </div>
                                          <div className={`font-mono ${Number(period.power) > 0 ? 'text-[#00DFA2]' : 'text-amber-300'}`}>
                                            {Number(period.power) > 0 ? '+' : ''}{period.power} kW
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="rounded-xl border border-[#153B34] bg-[#081714] p-4">
                                    <div className="text-sm font-bold text-white mb-3">模板使用说明</div>
                                    <div className="space-y-3 text-[11px] text-slate-400 leading-relaxed">
                                      <p>1. 策略分配是高频操作，已放到上方；模板维护是低频操作，集中在此处。</p>
                                      <p>2. 功率大于 0 自动识别为充电，小于 0 自动识别为放电；未覆盖时段默认按 0 kW 静置处理。</p>
                                      <p>3. 图表中的折线表示模板功率曲线；固定分时模式下展示 TOU 色带，动态模式下仅展示市场电价辅助底带与价格折线。</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* L3: 智能经济调度 */}
                    {selectedL3StrategyTab === 'economic' && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                        <div className="bg-[#0C221E] border border-[#153B34] rounded-xl overflow-hidden shadow-lg">
                          <div className="px-5 py-4 border-b border-[#153B34] bg-[#081714]/60 flex items-center justify-between gap-4">
                            <div>
                              <h4 className="text-white font-bold text-base flex items-center gap-2">
                                <Cloud size={18} className="text-blue-300" />
                                智能经济调度
                              </h4>
                              <p className="text-xs text-slate-500 mt-1">
                                横向切换近7天历史、今日和未来3日策略，默认聚焦今日运行计划。
                              </p>
                            </div>
                            <button
                              onClick={syncCloudForecastPrices}
                              className="shrink-0 px-3 py-2 rounded-lg bg-blue-400 text-[#051210] text-xs font-bold flex items-center gap-1 hover:brightness-110"
                            >
                              <RefreshCw size={14} />
                              同步云端预测
                            </button>
                          </div>
                          <div className="p-4">
                            <div ref={economicDateScrollerRef} className="flex gap-3 overflow-x-auto pb-1 scroll-smooth">
                              {cloudForecastPriceDays.map((item) => (
                                <ForecastDateChip
                                  key={item.date}
                                  item={item}
                                  active={item.date === selectedForecastDate}
                                  chipRef={item.type === 'today' ? todayForecastChipRef : null}
                                  onSelect={() => setSelectedEconomicDate(item.date)}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4">
                          <div className="col-span-7 bg-[#0C221E] border border-[#153B34] rounded-xl p-5 shadow-lg">
                            <div className="flex items-center justify-between mb-4 gap-4">
                              <div>
                                <h4 className="text-white font-bold text-base flex items-center gap-2">
                                  <LineChart size={18} className="text-[#00DFA2]" />
                                  预测价格曲线
                                </h4>
                                <p className="text-xs text-slate-500 mt-1">
                                  {selectedForecastDay?.date || '--'} / {dynamicTariffGranularity === '96' ? '96点/15分钟' : '48点/30分钟'}，明细数据按需切换查看。
                                </p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="px-2 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-[10px]">
                                  置信度 {selectedForecastDay?.confidence || '--'}
                                </span>
                                {selectedForecastDay?.type !== 'history' && (
                                  <button
                                    onClick={() => generateDailyEconomicPlan(selectedForecastDay.date)}
                                    className="px-3 py-2 rounded-lg bg-[#00DFA2] text-[#051210] text-xs font-bold"
                                  >
                                    重新生成
                                  </button>
                                )}
                              </div>
                            </div>
                            <EconomicForecastChart
                              rows={selectedForecastDay?.rows || []}
                              plan={selectedEconomicPlan}
                              view={economicPriceView}
                              onViewChange={setEconomicPriceView}
                            />
                          </div>

                          <div className="col-span-5 bg-[#0C221E] border border-[#153B34] rounded-xl overflow-hidden shadow-lg">
                            <div className="px-5 py-4 border-b border-[#153B34] bg-[#081714]/60">
                              <h4 className="text-white font-bold text-base flex items-center gap-2">
                                <ShieldCheck size={18} className="text-[#00DFA2]" />
                                每日自动生成策略
                              </h4>
                              <p className="text-xs text-slate-500 mt-1">当前展示选中日期的策略，支持人工调整并保存。</p>
                            </div>
                            <div className="p-4">
                            {selectedForecastDay && (
                              <EconomicPlanCard
                                forecast={selectedForecastDay}
                                plan={dailyEconomicPlans[selectedForecastDay.date]}
                                editMode={economicPlanEditMode === selectedForecastDay.date}
                                draft={economicPlanEditMode === selectedForecastDay.date ? economicPlanDraft : null}
                                error={economicPlanEditMode === selectedForecastDay.date ? economicPlanError : ''}
                                onGenerate={() => generateDailyEconomicPlan(selectedForecastDay.date)}
                                onEdit={() => startEconomicPlanEdit(selectedForecastDay.date)}
                                onCancel={cancelEconomicPlanEdit}
                                onSave={saveEconomicPlanDraft}
                                onPublish={() => publishEconomicPlan(selectedForecastDay.date)}
                                onRun={() => markEconomicPlanAsRun(selectedForecastDay.date)}
                                onChangePeriod={updateEconomicPlanDraftPeriod}
                              />
                            )}
                            </div>
                          </div>
                        </div>

                        <div className="bg-[#0C221E] border border-[#153B34] rounded-xl overflow-hidden shadow-lg">
                          <div className="px-5 py-4 border-b border-[#153B34] bg-[#081714]/60 flex items-center justify-between gap-4">
                            <div>
                              <h4 className="text-white font-bold text-base flex items-center gap-2">
                                <BarChart2 size={18} className="text-[#00DFA2]" />
                                运行回归分析
                              </h4>
                              <p className="text-xs text-slate-500 mt-1">对已运行策略进行计划/实际对比，识别电价预测、功率执行与SOC偏差。</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <select
                                value={selectedRegressionDate}
                                onChange={(event) => setSelectedRegressionDate(event.target.value)}
                                className="bg-[#081714] border border-[#153B34] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00DFA2]"
                              >
                                <option value="">选择已运行日期</option>
                                {Object.values(dailyEconomicPlans)
                                  .filter((plan) => ['已运行', '已回归'].includes(plan.status))
                                  .map((plan) => (
                                    <option key={plan.date} value={plan.date}>{plan.date}</option>
                                  ))}
                              </select>
                              <button
                                onClick={() => selectedRegressionDate && generateRegressionForPlan(selectedRegressionDate)}
                                disabled={!selectedRegressionDate}
                                className="px-3 py-2 rounded-lg bg-gradient-to-r from-[#00DFA2] to-[#10B981] text-[#051210] text-xs font-bold disabled:opacity-40"
                              >
                                生成回归分析
                              </button>
                            </div>
                          </div>
                          <RegressionPanel
                            report={selectedRegressionReport}
                            onOpenDetail={() => setShowRegressionDetailModal(true)}
                          />
                        </div>
                      </div>
                    )}

                    {/* L3: 计划曲线 */}
                    {selectedL3StrategyTab === 'plan_curve' && (
                      <PlanCurveStrategyPage
                        source={planCurveSource}
                        onSourceChange={setPlanCurveSource}
                        data={planCurveData}
                        resourceConfig={planCurveResourceConfig}
                        onResourceChange={updatePlanCurveResource}
                        targetAdjustments={planCurveTargetAdjustments}
                        onTargetChange={updatePlanCurveTargetAdjustment}
                      />
                    )}

                    {/* L3: 绿电消纳 (PV) */}
                    {selectedL3StrategyTab === 'green' && (
                      <div className="grid grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="col-span-4">
                          <div className="bg-[#081714] border border-[#153B34] rounded-xl p-5 shadow-lg h-full">
                            <h5 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Sun size={16} className="text-amber-400"/> 光储协同计算状态</h5>
                            <div className="space-y-3 mb-6">
                              <SyncStatusItem label="辐照度预测" status="晴天" time="实时" />
                              <SyncStatusItem label="光伏功率预测 (CV)" status="运行中" time="实时" />
                              <SyncStatusItem label="防逆流动态约束" status="生效中" time="最高级" />
                            </div>
                            <div className="text-[10px] text-slate-500 bg-[#051210] p-2 rounded border border-[#153B34]">策略逻辑：预判中午光伏溢出，提前腾出储能空间；光伏高峰时强制储能充电，减少弃光。</div>
                          </div>
                        </div>
                        <div className="col-span-8">
                          <div className="bg-[#0C221E] border border-[#153B34] rounded-xl p-5 shadow-lg h-full">
                             <div className="flex justify-between items-center mb-4">
                               <h4 className="text-sm font-bold text-white flex items-center gap-2"><LineChart size={16} className="text-[#00DFA2]"/> 光储协同预测曲线</h4>
                               <div className="flex gap-3 text-[10px]">
                                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-400"></div> 光伏预测</span>
                                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#00DFA2]"></div> 储能动作</span>
                               </div>
                             </div>
                             <div className="h-48 bg-[#081714] rounded-lg border border-[#153B34] p-2 relative">
                                <svg viewBox="0 0 600 150" className="w-full h-full" preserveAspectRatio="none">
                                   <line x1="0" y1="100" x2="600" y2="100" stroke="#153B34" strokeWidth="1" />
                                   <path d="M 150 100 Q 300 -50, 450 100 Z" fill="rgba(251, 191, 36, 0.15)" stroke="#FBBF24" strokeWidth="1" strokeDasharray="4" />
                                   <path d="M 0 50 L 150 100 C 250 100, 300 20, 450 20 L 600 20" fill="none" stroke="#00DFA2" strokeWidth="2" />
                                </svg>
                             </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </>
          )}

          {activePrimaryMenu === '系统管理' && activeSecondaryMenu === '档案管理' && (
            <StationArchivePage
              storageBoundaryConfig={storageBoundaryConfig}
              onOpenStorageBoundaryModal={openStorageBoundaryModal}
            />
          )}

          {activePrimaryMenu !== '策略中心' && !(activePrimaryMenu === '系统管理' && activeSecondaryMenu === '费率时段') && !(activePrimaryMenu === '系统管理' && activeSecondaryMenu === '档案管理') && (
            renderPlaceholderContent(activePrimaryMenu, activeSecondaryMenu)
          )}

          <GridSwitchConfirmModal
            open={showGridSwitchModal}
            config={gridSwitchConfig}
            targetMeta={pendingGridSwitchMeta}
            targetMode={pendingGridSwitchTarget}
            onClose={closeGridSwitchModal}
            onConfirm={confirmGridSwitch}
          />

          {showStorageBoundaryModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowStorageBoundaryModal(false)}></div>
              <div className="relative bg-gradient-to-br from-[#0C221E] to-[#081714] border border-[#00DFA2]/40 rounded-2xl w-[760px] shadow-[0_0_30px_rgba(0,223,162,0.12)] overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="flex justify-between items-center px-6 py-4 border-b border-[#153B34] bg-[#051210]/50">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Settings size={20} className="text-[#00DFA2]" />
                      储能运行边界配置
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">站级约束，削峰填谷智能规划与经济调度都按此边界限幅。</p>
                  </div>
                  <button onClick={() => setShowStorageBoundaryModal(false)} className="text-slate-400 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <StorageBoundaryInput label="SOC运行下限(%)" value={storageBoundaryDraft.socMin} onChange={(value) => updateStorageBoundaryDraft('socMin', value)} />
                    <StorageBoundaryInput label="SOC运行上限(%)" value={storageBoundaryDraft.socMax} onChange={(value) => updateStorageBoundaryDraft('socMax', value)} />
                    <StorageBoundaryInput label="充电功率下限(kW)" value={storageBoundaryDraft.chargePowerMin} onChange={(value) => updateStorageBoundaryDraft('chargePowerMin', value)} />
                    <StorageBoundaryInput label="充电功率上限(kW)" value={storageBoundaryDraft.chargePowerMax} onChange={(value) => updateStorageBoundaryDraft('chargePowerMax', value)} />
                    <StorageBoundaryInput label="放电功率下限(kW)" value={storageBoundaryDraft.dischargePowerMin} onChange={(value) => updateStorageBoundaryDraft('dischargePowerMin', value)} />
                    <StorageBoundaryInput label="放电功率上限(kW)" value={storageBoundaryDraft.dischargePowerMax} onChange={(value) => updateStorageBoundaryDraft('dischargePowerMax', value)} />
                    <StorageBoundaryInput label="备用SOC(%)" value={storageBoundaryDraft.reserveSoc} onChange={(value) => updateStorageBoundaryDraft('reserveSoc', value)} />
                  </div>
                  <div className="rounded-xl border border-[#153B34] bg-[#081714] px-4 py-3 text-xs text-slate-400 leading-relaxed">
                    保存后只影响后续生成和保存校验，不自动重写已发布策略。需要刷新已生成策略时，请在经济调度页点击“重新生成”。
                  </div>
                  {storageBoundaryError && (
                    <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                      {storageBoundaryError}
                    </div>
                  )}
                </div>

                <div className="border-t border-[#153B34] px-6 py-4 bg-[#051210]/50 flex justify-end gap-3">
                  <button onClick={() => setShowStorageBoundaryModal(false)} className="px-5 py-2 text-sm text-slate-300 hover:text-white transition-colors">
                    取消
                  </button>
                  <button onClick={saveStorageBoundaryDraft} className="px-6 py-2 text-sm bg-gradient-to-r from-[#00DFA2] to-[#10B981] text-[#051210] font-bold rounded-lg shadow-lg hover:brightness-110 transition-all flex items-center gap-2">
                    <Save size={16} />
                    保存配置
                  </button>
                </div>
              </div>
            </div>
          )}

          {showL3SwitchModal && pendingStrategyMeta && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeL3SwitchModal}></div>
              <div className="relative bg-gradient-to-br from-[#0C221E] to-[#081714] border border-blue-500/40 rounded-2xl w-[560px] shadow-[0_0_30px_rgba(96,165,250,0.12)] overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="flex justify-between items-center px-6 py-4 border-b border-[#153B34] bg-[#051210]/50">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <GitBranch size={20} className="text-blue-300" />
                      切换当前运行策略
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">同一时间只能运行一个智能策略，请确认后再切换。</p>
                  </div>
                  <button onClick={closeL3SwitchModal} className="text-slate-400 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>
                <div className="p-6 space-y-5">
                  <div>
                    <div className="text-xs font-bold text-slate-300 mb-2">选择目标策略</div>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(l3StrategyMeta).map(([key, item]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setPendingL3Strategy(key)}
                          className={`rounded-lg border px-3 py-2 text-left transition-all ${
                            pendingL3Strategy === key
                              ? 'border-blue-400 bg-blue-500/10 text-white'
                              : 'border-[#153B34] bg-[#081714] text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="text-xs font-bold">{item.label}</div>
                          {l3Strategy === key && <div className="text-[10px] text-[#00DFA2] mt-1">当前运行</div>}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
                    <div className="rounded-xl border border-[#153B34] bg-[#081714] p-4">
                      <div className="text-[11px] text-slate-500 mb-1">当前策略</div>
                      <div className="text-sm font-bold text-white">{activeStrategyMeta.label}</div>
                      <div className="text-[10px] text-[#00DFA2] mt-2">运行中</div>
                    </div>
                    <ChevronRight size={22} className="text-blue-300" />
                    <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
                      <div className="text-[11px] text-slate-500 mb-1">目标策略</div>
                      <div className="text-sm font-bold text-white">{pendingStrategyMeta.label}</div>
                      <div className="text-[10px] text-blue-300 mt-2">待启用</div>
                    </div>
                  </div>
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-200 leading-relaxed">
                    确认后将停用 {activeStrategyMeta.label}，并启用 {pendingStrategyMeta.label}。当前 Demo 只更新前端运行状态，真实下发时应追加权限校验和操作记录。
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-[#153B34] bg-[#051210]/40 flex justify-end gap-3">
                  <button onClick={closeL3SwitchModal} className="px-4 py-2 rounded-lg border border-[#153B34] text-sm text-slate-300 hover:text-white">
                    取消
                  </button>
                  <button
                    onClick={confirmL3StrategySwitch}
                    disabled={pendingL3Strategy === l3Strategy}
                    className="px-4 py-2 rounded-lg bg-[#00DFA2] text-[#051210] text-sm font-bold disabled:opacity-40"
                  >
                    确认切换
                  </button>
                </div>
              </div>
            </div>
          )}

          {showRegressionDetailModal && selectedRegressionReport && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowRegressionDetailModal(false)}></div>
              <div className="relative bg-gradient-to-br from-[#0C221E] to-[#081714] border border-[#00DFA2]/40 rounded-2xl w-[900px] shadow-[0_0_30px_rgba(0,223,162,0.12)] overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="flex justify-between items-center px-6 py-4 border-b border-[#153B34] bg-[#051210]/50">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <BarChart2 size={20} className="text-[#00DFA2]" />
                      回归偏差明细
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">{selectedRegressionReport.date} / 计划与实际执行对比</p>
                  </div>
                  <button onClick={() => setShowRegressionDetailModal(false)} className="text-slate-400 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>
                <div className="p-6">
                  <div className="rounded-xl border border-[#153B34] overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#081714] text-slate-500 uppercase">
                        <tr>
                          <th className="px-4 py-3 border-b border-[#153B34]">时段</th>
                          <th className="px-4 py-3 border-b border-[#153B34]">计划功率</th>
                          <th className="px-4 py-3 border-b border-[#153B34]">实际功率</th>
                          <th className="px-4 py-3 border-b border-[#153B34]">计划SOC</th>
                          <th className="px-4 py-3 border-b border-[#153B34]">实际SOC</th>
                          <th className="px-4 py-3 border-b border-[#153B34]">未执行原因</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#153B34] bg-[#0B1E1A]">
                        {selectedRegressionReport.rows.map((row) => (
                          <tr key={row.id}>
                            <td className="px-4 py-3 font-mono">{row.start}-{row.end}</td>
                            <td className="px-4 py-3 text-[#00DFA2]">{row.plannedPower} kW</td>
                            <td className="px-4 py-3 text-blue-300">{row.actualPower} kW</td>
                            <td className="px-4 py-3 text-slate-300">{row.plannedSoc}%</td>
                            <td className="px-4 py-3 text-slate-300">{row.actualSoc}%</td>
                            <td className="px-4 py-3 text-slate-400">{row.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showCollectorModal && (
            <div className="fixed inset-0 z-40 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCollectorModal(false)}></div>
              <div className="relative bg-gradient-to-br from-[#0C221E] to-[#081714] border border-[#00DFA2]/40 rounded-2xl w-[980px] shadow-[0_0_30px_rgba(0,223,162,0.12)] overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="flex justify-between items-center px-6 py-4 border-b border-[#153B34] bg-[#051210]/50">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Database size={20} className="text-[#00DFA2]" />
                      关联采集设备
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">选择待关联的采集器，并预览该设备的 DI/DO 物模型点位。</p>
                  </div>
                  <button onClick={() => setShowCollectorModal(false)} className="text-slate-400 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-12 gap-0">
                  <div className="col-span-5 border-r border-[#153B34] p-5 space-y-3 max-h-[560px] overflow-y-auto">
                    {availableCollectorDevices.map((item) => {
                      const isAssociated = collectorDevices.some((collector) => collector.id === item.id);
                      const isSelected = collectorModalSelection.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setCollectorModalPreviewId(item.id);
                            if (!isAssociated) toggleCollectorModalSelection(item.id);
                          }}
                          className={`w-full text-left rounded-xl border p-4 transition-all ${
                            collectorModalPreviewId === item.id
                              ? 'border-[#00DFA2] bg-[#00DFA2]/10'
                              : 'border-[#153B34] bg-[#081714] hover:border-[#2b6459]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div>
                              <div className="text-white font-bold">{item.name}</div>
                              <div className="text-[11px] text-slate-500 mt-1">{item.category}</div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] border ${item.status === 'online' ? 'border-[#00DFA2]/30 bg-[#00DFA2]/10 text-[#00DFA2]' : 'border-slate-600 bg-slate-700/20 text-slate-400'}`}>
                                {item.status === 'online' ? '在线' : '离线'}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] border ${isAssociated ? 'border-blue-500/30 bg-blue-500/10 text-blue-300' : isSelected ? 'border-amber-500/30 bg-amber-500/10 text-amber-300' : 'border-[#153B34] text-slate-500'}`}>
                                {isAssociated ? '已关联' : isSelected ? '待关联' : '未关联'}
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-slate-400">{item.group}</div>
                          <div className="flex items-center justify-between mt-4 text-[11px] text-slate-500">
                            <span>{item.modelSource}</span>
                            <span>DI {item.pointStats.di} / DO {item.pointStats.do}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="col-span-7 p-5 max-h-[560px] overflow-y-auto">
                    <div className="mb-4">
                      <h4 className="text-sm font-bold text-white">点位预览</h4>
                      <p className="text-[11px] text-slate-400 mt-1">预览当前采集器的物模型点位，确认后加入 EMS 的动环配置范围。</p>
                    </div>
                    <div className="space-y-5">
                      <SignalPreviewTable title="DI 点位预览" items={previewDiSignals} />
                      <SignalPreviewTable title="DO 点位预览" items={previewDoSignals} />
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#153B34] px-6 py-4 bg-[#051210]/50 flex justify-end gap-3">
                  <button onClick={() => setShowCollectorModal(false)} className="px-5 py-2 text-sm text-slate-300 hover:text-white transition-colors">
                    取消
                  </button>
                  <button onClick={confirmCollectorAssociation} className="px-6 py-2 text-sm bg-gradient-to-r from-[#00DFA2] to-[#10B981] text-[#051210] font-bold rounded-lg shadow-lg hover:brightness-110 transition-all">
                    确认关联
                  </button>
                </div>
              </div>
            </div>
          )}

          {showStrategyModal && strategyDraft && (
            <div className="fixed inset-0 z-40 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeStrategyModal}></div>
              <div className="relative bg-gradient-to-br from-[#0C221E] to-[#081714] border border-[#00DFA2]/40 rounded-2xl w-[1100px] shadow-[0_0_30px_rgba(0,223,162,0.12)] overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="flex justify-between items-center px-6 py-4 border-b border-[#153B34] bg-[#051210]/50">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Wrench size={20} className="text-amber-400" />
                      {strategyModalMode === 'create' ? '新增动环策略' : '编辑动环策略'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">按设备作用域编排判断条件、设备动作和平台动作，所有改动仅在点击保存后生效。</p>
                  </div>
                  <button onClick={closeStrategyModal} className="text-slate-400 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 max-h-[72vh] overflow-y-auto">
                  <StrategyEditor
                    item={strategyDraft}
                    devices={strategyDevices}
                    signalPoints={signalPoints}
                    onChangeField={updateStrategyDraftField}
                    onChangeCondition={updateStrategyDraftCondition}
                    onChangeAction={updateStrategyDraftDeviceAction}
                    onChangePlatformAction={updateStrategyDraftPlatformAction}
                    onAddCondition={addStrategyCondition}
                    onAddAction={addStrategyDeviceAction}
                    onRemoveCondition={removeStrategyCondition}
                    onRemoveAction={removeStrategyAction}
                    onOpenPointPicker={openPointPicker}
                    onMoveAction={moveStrategyAction}
                    onReorderAction={reorderStrategyDeviceAction}
                  />
                </div>

                <div className="border-t border-[#153B34] px-6 py-4 bg-[#051210]/50 flex justify-end gap-3">
                  <button onClick={closeStrategyModal} className="px-5 py-2 text-sm text-slate-300 hover:text-white transition-colors">
                    取消
                  </button>
                  <button onClick={saveStrategyDraft} className="px-6 py-2 text-sm bg-gradient-to-r from-[#00DFA2] to-[#10B981] text-[#051210] font-bold rounded-lg shadow-lg hover:brightness-110 transition-all flex items-center gap-2">
                    <Save size={16} />
                    保存
                  </button>
                </div>
              </div>
            </div>
          )}

          {pointPickerState && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setPointPickerState(null)}></div>
              <div className="relative w-[820px] bg-gradient-to-br from-[#0C221E] to-[#081714] border border-[#00DFA2]/30 rounded-2xl shadow-[0_0_30px_rgba(0,223,162,0.12)] overflow-hidden">
                <div className="flex justify-between items-center px-6 py-4 border-b border-[#153B34] bg-[#051210]/50">
                  <div>
                    <h3 className="text-lg font-bold text-white">选择点位</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      当前设备：{getDeviceName(strategyDevices, pointPickerState.deviceId)}，请选择
                      {pointPickerState.mode === 'condition' ? '判断条件点位' : '设备动作控制点位'}。
                    </p>
                  </div>
                  <button onClick={() => setPointPickerState(null)} className="text-slate-400 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 max-h-[70vh] overflow-y-auto">
                  <PointPickerPanel
                    items={pointPickerOptions}
                    onSelect={applyPointSelection}
                  />
                </div>

                <div className="border-t border-[#153B34] px-6 py-4 bg-[#051210]/50 flex justify-end">
                  <button onClick={() => setPointPickerState(null)} className="px-5 py-2 text-sm text-slate-300 hover:text-white transition-colors">
                    关闭
                  </button>
                </div>
              </div>
            </div>
          )}

          {showAntiBackflowModal && (
            <L1StrategyModal
              title="逆功率保护"
              open={showAntiBackflowModal}
              onClose={() => setShowAntiBackflowModal(false)}
              config={antiBackflowConfig}
              onChange={updateAntiBackflowField}
              options={[
                '降低储能放电功率，直到静置',
                '降低储能放电功率，必要时可以充电',
              ]}
              noteLines={[
                '电网不希望电站未经批准向外倒送逆功率，因此站内需要配置本地保护。',
                '目标值建议比限制值预留 1-5kW 的执行裕量，以减少现场振荡。',
              ]}
            />
          )}

          {showDemandControlModal && (
            <L1StrategyModal
              title="需量控制"
              open={showDemandControlModal}
              onClose={() => setShowDemandControlModal(false)}
              config={demandControlConfig}
              onChange={updateDemandControlField}
              options={[
                '降低储能充电功率，直到静置',
                '降低储能充电功率，必要时可以放电',
              ]}
              noteLines={[
                '需量控制用于限制整体用电功率不超过申报需量，以保护变压器并降低超需量风险。',
                '目标值建议略低于限制值，给 PCS 执行误差和现场波动留出缓冲。',
                '有序充电用于在需量逼近限制值时调度充电负荷，避免单靠储能放电承担全部调节。',
              ]}
              chargerControl
            />
          )}

          {showBatchApplyModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowBatchApplyModal(false)}></div>
              <div className="relative w-[860px] bg-gradient-to-br from-[#0C221E] to-[#081714] border border-[#00DFA2]/30 rounded-2xl shadow-[0_0_30px_rgba(0,223,162,0.12)] overflow-hidden">
                <div className="flex justify-between items-center px-6 py-4 border-b border-[#153B34] bg-[#051210]/50">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <CalendarDays size={20} className="text-[#00DFA2]" />
                      批量复用模板
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">为 {selectedMonth} 月选择多个日期，并一次性应用同一个充放电模板。</p>
                  </div>
                  <button onClick={() => setShowBatchApplyModal(false)} className="text-slate-400 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 space-y-5 max-h-[74vh] overflow-y-auto">
                  <div className="rounded-xl border border-[#153B34] bg-[#081714] p-4">
                    <label className="block text-xs text-slate-400 mb-1.5">选择要复用的模板</label>
                    <select
                      value={batchApplyTemplateId}
                      onChange={(event) => setBatchApplyTemplateId(event.target.value)}
                      className="w-full bg-[#0C221E] border border-[#153B34] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00DFA2]"
                    >
                      {peakTemplates.map((template) => (
                        <option key={template.id} value={template.id}>{template.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="rounded-xl border border-[#153B34] bg-[#081714] p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-sm font-bold text-white">选择应用日期</div>
                        <div className="text-[11px] text-slate-400 mt-1">已选择 {batchApplyDays.length} 天，确认后会写入日覆盖。</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setBatchApplyDays(selectedMonthDays)} className="px-3 py-1.5 text-xs rounded-lg border border-[#153B34] text-slate-300 hover:text-white">全选当月</button>
                        <button onClick={() => setBatchApplyDays([])} className="px-3 py-1.5 text-xs rounded-lg border border-[#153B34] text-slate-300 hover:text-white">清空</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-7 gap-2 mb-2">
                      {weekDayLabels.map((label, index) => (
                        <div key={`batch-${label}`} className={`text-center text-[11px] font-bold py-2 rounded-lg border border-[#153B34] bg-[#0C221E] ${index >= 5 ? 'text-amber-300' : 'text-slate-400'}`}>
                          {label}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {selectedMonthCalendarCells.map((cell) => {
                        if (cell.type === 'empty') {
                          return <div key={`batch-${cell.id}`} className="h-16 rounded-lg border border-[#153B34]/40 bg-[#0C221E]/30"></div>;
                        }
                        const holidayLabel = getHolidayLabel(selectedMonth, cell.day);
                        const isSelected = batchApplyDays.includes(cell.day);
                        return (
                          <button
                            key={`batch-${cell.id}`}
                            onClick={() => toggleBatchApplyDay(cell.day)}
                            className={`h-16 rounded-lg border p-2 text-left transition-all ${
                              isSelected
                                ? 'border-[#00DFA2] bg-[#00DFA2]/12 shadow-[0_0_12px_rgba(0,223,162,0.12)]'
                                : 'border-[#153B34] bg-[#0C221E] hover:border-[#2b6459]'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-white">{String(cell.day).padStart(2, '0')}</span>
                              {isSelected && <CheckCircle2 size={14} className="text-[#00DFA2]" />}
                            </div>
                            {holidayLabel && <div className="text-[10px] text-red-300 mt-1">{holidayLabel}</div>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#153B34] px-6 py-4 bg-[#051210]/50 flex justify-end gap-3">
                  <button onClick={() => setShowBatchApplyModal(false)} className="px-5 py-2 text-sm text-slate-300 hover:text-white transition-colors">
                    取消
                  </button>
                  <button
                    onClick={confirmBatchApplyTemplate}
                    disabled={batchApplyDays.length === 0}
                    className="px-6 py-2 text-sm bg-gradient-to-r from-[#00DFA2] to-[#10B981] text-[#051210] font-bold rounded-lg shadow-lg hover:brightness-110 transition-all disabled:opacity-40"
                  >
                    应用到已选 {batchApplyDays.length} 天
                  </button>
                </div>
              </div>
            </div>
          )}

          {showTemplateModal && (
            <PeakTemplateModal
              mode={templateModalMode}
              draft={templateDraft}
              error={templateValidationError}
              onClose={closeTemplateModal}
              onSave={saveTemplateDraft}
              onChangeField={updateTemplateDraftField}
              onChangePeriod={updateTemplateDraftPeriod}
              onAddPeriod={addTemplateDraftPeriod}
              onRemovePeriod={removeTemplateDraftPeriod}
              onOpenSmartPlan={openSmartPlanForTemplate}
            />
          )}

          {/* ========================================================= */}
          {/* ===================== 智能规划弹窗 ======================= */}
          {/* ========================================================= */}
          {showSmartPlanModal && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeSmartPlanModal}></div>
              
              <div className="relative bg-gradient-to-br from-[#0C221E] to-[#081714] border border-[#00DFA2]/50 rounded-2xl w-[800px] shadow-[0_0_30px_rgba(0,223,162,0.15)] overflow-hidden animate-in zoom-in-95 duration-300">
                
                {/* Modal Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-[#153B34] bg-[#051210]/50">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sparkles size={20} className="text-amber-400" />
                    智能收益规划向导
                  </h3>
                  <button onClick={closeSmartPlanModal} className="text-slate-400 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6">
                  {smartPlanState === 'idle' && (
                    <div className="flex flex-col items-center justify-center py-10 space-y-6">
                      <div className="text-center space-y-2">
                        <CalendarDays size={48} className="text-[#00DFA2] mx-auto opacity-80" />
                        <p className="text-lg font-bold text-white">选择要规划的日期</p>
                        <p className="text-sm text-slate-400">系统将根据当前电价配置模式自动生成收益最优的充放电策略。</p>
                      </div>
                      
                      <div className="flex items-center gap-4 bg-[#081714] border border-[#153B34] p-3 rounded-xl">
                         <span className="text-sm text-slate-400">规划日期：</span>
                         <input 
                           type="date" 
                           value={selectedPlanDate} 
                           onChange={(e) => setSelectedPlanDate(e.target.value)}
                           className="bg-transparent text-[#00DFA2] outline-none font-mono text-lg font-bold cursor-pointer [color-scheme:dark]" 
                         />
                      </div>
                      <div className="px-4 py-3 rounded-xl border border-[#153B34] bg-[#081714] text-sm text-slate-300">
                        当前电价模式：
                        <span className={`ml-2 font-bold ${priceMode === 'dynamic' ? 'text-blue-300' : 'text-[#00DFA2]'}`}>
                          {priceMode === 'dynamic' ? `动态市场化分时电价 (${dynamicTariffGranularity === '48' ? '48点/30分钟' : '96点/15分钟'})` : `固定分时电价 / ${selectedFixedTariffTemplate?.name}`}
                        </span>
                      </div>

                      <button 
                        onClick={startSmartPlanCalculation}
                        className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:brightness-110 flex items-center gap-2"
                      >
                        获取电价并开始计算
                      </button>
                    </div>
                  )}

                  {smartPlanState === 'calculating' && (
                    <div className="flex flex-col items-center justify-center py-20 space-y-6">
                      <Loader2 size={48} className="text-[#00DFA2] animate-spin" />
                      <div className="text-center space-y-2">
                        <p className="text-lg font-bold text-white">正在执行经济调度寻优 (MILP)...</p>
                        <p className="text-sm text-slate-400 animate-pulse">正在获取 {selectedPlanDate} 分时电价库参数...</p>
                      </div>
                      <div className="w-64 h-1 bg-[#051210] rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#00DFA2] to-blue-500 w-full animate-[progress_2s_ease-in-out_infinite] origin-left"></div>
                      </div>
                    </div>
                  )}

                  {smartPlanState === 'result' && (
                    <div className="space-y-6">
                      {/* Alert Info */}
                      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-start gap-3">
                        <CheckCircle2 size={18} className="text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-amber-500 font-bold">规划完成！预计当日套利收益：<span className="text-lg">￥ {smartPlanResult.profit.toFixed(2)}</span></p>
                          <p className="text-xs text-amber-500/70 mt-1">{smartPlanResult.note}</p>
                        </div>
                      </div>

                      {/* Chart Area */}
                      <div className="bg-[#051210] border border-[#153B34] rounded-xl p-4">
                        <h4 className="text-xs font-bold text-slate-300 mb-3 flex justify-between items-center">
                          <span>策略与电价叠加图</span>
                          <div className="flex gap-3">
                            <span className="flex items-center gap-1 text-[#00DFA2]"><Square size={10} fill="currentColor"/> 充电</span>
                            <span className="flex items-center gap-1 text-red-400"><Square size={10} fill="currentColor"/> 放电</span>
                            <span className="flex items-center gap-1 text-blue-400"><LineChart size={10} /> {priceMode === 'dynamic' ? '市场电价' : '分时电价'}</span>
                          </div>
                        </h4>
                        <PeakStrategyChart
                          periods={smartPlanDraftPeriods}
                          priceBands={peakTariffBands}
                          compact
                          tariffMode={priceMode}
                          fixedTariffPeriods={selectedFixedTariffTemplate?.periods || []}
                          dynamicTariffRows={dynamicTariffRows}
                          dynamicTariffGranularity={dynamicTariffGranularity}
                        />
                      </div>

                      {/* List Area */}
                      <div className="border border-[#153B34] rounded-xl overflow-hidden">
                        <table className="w-full text-xs text-left">
                          <thead className="text-slate-500 bg-[#051210] uppercase">
                            <tr>
                              <th className="px-4 py-2 border-b border-[#153B34]">时段</th>
                              <th className="px-4 py-2 border-b border-[#153B34]">对应电价</th>
                              <th className="px-4 py-2 border-b border-[#153B34]">策略动作</th>
                              <th className="px-4 py-2 border-b border-[#153B34]">推荐功率</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#153B34] bg-[#081714]">
                            {smartPlanDraftPeriods.map((period) => (
                              <tr key={`smart-plan-${period.id}`} className="hover:bg-[#0C221E]">
                                <td className="px-4 py-2 font-mono">{period.start} - {period.end}</td>
                                <td className="px-4 py-2 text-blue-300">
                                  {period.tariffPrice ? `${period.tariffPrice} 元/kWh` : (period.tariffBand?.price ? `${period.tariffBand.price} 元/kWh` : '--')}
                                </td>
                                <td className="px-4 py-2">
                                  <span className={`border px-2 py-0.5 rounded ${Number(period.power) > 0 ? 'text-[#00DFA2] border-[#00DFA2]/30' : 'text-red-400 border-red-400/30'}`}>
                                    {Number(period.power) > 0 ? '满功率充电' : '满功率放电'}
                                  </span>
                                </td>
                                <td className={`px-4 py-2 font-bold ${Number(period.power) > 0 ? 'text-[#00DFA2]' : 'text-red-400'}`}>
                                  {Number(period.power) > 0 ? '+' : ''}{Number(period.power).toFixed(1)} kW
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                {smartPlanState === 'result' && (
                  <div className="border-t border-[#153B34] px-6 py-4 bg-[#051210]/50 flex justify-end gap-3">
                    <button 
                      onClick={closeSmartPlanModal} 
                      className="px-5 py-2 text-sm text-slate-300 hover:text-white transition-colors"
                    >
                      取消
                    </button>
                    <button 
                      onClick={applySmartPlanToTemplateDraft}
                      disabled={!smartPlanFromTemplateModal || smartPlanDraftPeriods.length === 0}
                      className="px-6 py-2 text-sm bg-gradient-to-r from-[#00DFA2] to-[#10B981] text-[#051210] font-bold rounded-lg shadow-lg hover:brightness-110 transition-all flex items-center gap-2"
                    >
                      <Save size={16} /> 应用至当前模板
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

/* --- Sub Components --- */

const NavItem = ({ icon, label, badge, active, className, onClick }) => (
  <div onClick={onClick} className={`flex items-center justify-between px-3 py-2.5 mb-1 rounded-lg cursor-pointer transition-all duration-200 group ${active ? 'bg-gradient-to-r from-[#10B981]/20 to-transparent border-l-2 border-[#00DFA2] text-white shadow-inner' : `text-slate-400 hover:bg-[#0C221E] hover:text-slate-200 ${className || ''}`}`}>
    <div className="flex items-center gap-3">
      <span className={`${active ? 'text-[#00DFA2]' : 'text-slate-500 group-hover:text-slate-400'}`}>{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </div>
    {badge && <span className="bg-red-500/20 text-red-400 text-[10px] px-2 py-0.5 rounded-full border border-red-500/30">{badge}</span>}
  </div>
);

const TabButton = ({ active, icon, label, onClick, theme = 'green' }) => {
  const activeClass = theme === 'green' 
    ? 'bg-[#153B34] text-[#00DFA2] border-[#153B34] shadow-sm' 
    : 'bg-blue-900/40 text-blue-400 border-blue-500/30 shadow-sm';
  
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${active ? activeClass : 'text-slate-400 hover:text-slate-200 hover:bg-[#081714] border border-transparent'}`}>
      {icon} {label}
    </button>
  );
};

const FormInput = ({ label, defaultValue, hint }) => (
  <div>
    <label className="block text-xs text-slate-400 mb-1">{label}</label>
    <div className="flex gap-2 relative">
      <input type="number" defaultValue={defaultValue} className="flex-1 bg-[#081714] border border-[#153B34] rounded text-white px-3 py-1.5 text-sm focus:border-[#00DFA2] focus:outline-none" />
      {hint && <span className="flex items-center text-[10px] text-slate-500 absolute right-3 top-2">{hint}</span>}
    </div>
  </div>
);

const MetricCard = ({ title, value, hint, tone = 'green' }) => {
  const toneClassMap = {
    green: 'border-[#00DFA2]/30 bg-[#00DFA2]/10 text-[#00DFA2]',
    blue: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
    amber: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    red: 'border-red-500/30 bg-red-500/10 text-red-400',
  };

  return (
    <div className="bg-[#0C221E] border border-[#153B34] rounded-xl p-4 shadow-lg">
      <p className="text-xs text-slate-500 mb-3">{title}</p>
      <div className="flex items-end justify-between gap-3">
        <span className="text-3xl font-bold text-white">{value}</span>
        <span className={`px-2.5 py-1 rounded-full border text-[10px] ${toneClassMap[tone]}`}>{hint}</span>
      </div>
    </div>
  );
};

const CollectorHeader = ({ items, selectedCollectorId, onSelect, onOpenModal }) => (
  <div className="bg-[#0C221E] border border-[#153B34] rounded-xl overflow-hidden shadow-lg">
    <div className="p-4 border-b border-[#153B34] bg-[#081714]/60 flex items-center justify-between">
      <div>
        <h4 className="text-white font-bold text-sm flex items-center gap-2">
          <Database size={16} className="text-[#00DFA2]" />
          采集设备关联
        </h4>
        <p className="text-[11px] text-slate-400 mt-1">一个 EMS 可关联多个 DI/DO 采集器，策略配置统一引用到“采集器设备 + 点位通道”。</p>
      </div>
      <button onClick={onOpenModal} className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border border-[#153B34] bg-[#0C221E] text-slate-300 hover:text-white transition-colors">
        <Plus size={14} />
        关联采集设备
      </button>
    </div>
    <div className="grid grid-cols-3 gap-4 p-4">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          className={`text-left rounded-xl border p-4 transition-all ${
            item.id === selectedCollectorId
              ? 'border-[#00DFA2] bg-[#00DFA2]/10 shadow-[0_0_15px_rgba(0,223,162,0.15)]'
              : 'border-[#153B34] bg-[#081714] hover:border-[#2b6459]'
          }`}
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="text-white font-bold">{item.name}</div>
              <div className="text-[11px] text-slate-500 mt-1">{item.category}</div>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] border ${item.status === 'online' ? 'border-[#00DFA2]/30 bg-[#00DFA2]/10 text-[#00DFA2]' : 'border-slate-600 bg-slate-700/20 text-slate-400'}`}>
              {item.status === 'online' ? '在线' : '离线'}
            </span>
          </div>
          <div className="text-xs text-slate-400">{item.group}</div>
          <div className="flex items-center justify-between mt-4 text-[11px] text-slate-500">
            <span>{item.modelSource}</span>
            <span>DI {item.pointStats.di} / DO {item.pointStats.do}</span>
          </div>
        </button>
      ))}
    </div>
  </div>
);

const SignalConfigPanel = ({
  title,
  icon,
  description,
  items,
  selectedCollector,
  editMode,
  onChange,
}) => (
  <div className="bg-[#0C221E] border border-[#153B34] rounded-xl overflow-hidden shadow-lg h-full">
    <div className="p-4 border-b border-[#153B34] bg-[#081714]/60">
      <div>
        <h4 className="text-white font-bold text-sm flex items-center gap-2">
          {icon}
          {title}
        </h4>
        <p className="text-[11px] text-slate-400 mt-1">{description}</p>
        <p className="text-[11px] text-slate-500 mt-2">当前展示采集器：<span className="text-slate-300">{selectedCollector.name}</span></p>
      </div>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-xs text-left">
        <thead className="bg-[#081714] text-slate-500 uppercase">
          <tr>
            <th className="px-4 py-3 border-b border-[#153B34]">点位编码</th>
            <th className="px-4 py-3 border-b border-[#153B34]">物模型名称 / 原始通道</th>
            <th className="px-4 py-3 border-b border-[#153B34]">点位名称</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#153B34]">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-[#081714]/70 transition-colors">
              <td className="px-4 py-3 font-mono text-[#00DFA2]">{item.pointCode}</td>
              <td className="px-4 py-3 text-slate-400 font-mono">{item.originModelName}</td>
              <td className="px-4 py-3">
                {editMode ? (
                  <input type="text" value={item.displayName} onChange={(e) => onChange(item.id, 'displayName', e.target.value)} className="w-full bg-[#081714] border border-[#153B34] rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-[#00DFA2]" />
                ) : (
                  <span className="text-slate-200">{item.displayName}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const formatConditionLabel = (condition, devices) =>
  `${getDeviceName(devices, condition.deviceId)} / ${condition.pointLabel || condition.pointCode || '未选点位'} ${condition.rule} ${condition.value || '-'}`;

const formatActionLabel = (action, devices) =>
  `#${action.order} ${getDeviceName(devices, action.deviceId)} / ${action.pointLabel || action.pointCode || '未选点位'} -> ${action.command || '未设置动作'}`;

const EnvStrategyRow = ({ item, devices, onEdit, onToggleEnabled, onDuplicate }) => (
  <tr className="hover:bg-[#081714]/80 transition-colors align-top">
    <td className="px-4 py-3 border-b border-[#153B34]/50">
      <button onClick={() => onToggleEnabled(item.id)} className={`w-11 h-6 rounded-full transition-colors relative ${item.enabled ? 'bg-[#00DFA2]' : 'bg-slate-700'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${item.enabled ? 'left-5' : 'left-0.5'}`}></span>
      </button>
    </td>
    <td className="px-4 py-3 border-b border-[#153B34]/50">
      <div className="text-slate-200 font-medium">{item.name}</div>
      <div className="text-[10px] text-slate-500 mt-1">{item.logicMode === 'AND' ? '全部满足' : '任一满足'}</div>
    </td>
    <td className="px-4 py-3 border-b border-[#153B34]/50">
      <span className="inline-flex px-2 py-0.5 rounded border border-[#153B34] bg-[#081714] text-[#00DFA2] font-mono">{item.code}</span>
    </td>
    <td className="px-4 py-3 border-b border-[#153B34]/50">
      <div className="flex flex-wrap gap-2">
        {item.conditions.map((condition, index) => (
          <span key={`${item.id}-condition-${index}`} className="px-2 py-1 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/20">
            {formatConditionLabel(condition, devices)}
          </span>
        ))}
      </div>
    </td>
    <td className="px-4 py-3 border-b border-[#153B34]/50">
      <div className="flex flex-wrap gap-2">
        {[...item.deviceActions].sort((a, b) => a.order - b.order).map((action, index) => (
          <span key={`${item.id}-action-${index}`} className="px-2 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20">
            {formatActionLabel(action, devices)}
          </span>
        ))}
      </div>
    </td>
    <td className="px-4 py-3 border-b border-[#153B34]/50 text-slate-300">
      {item.platformAction.type === '触发告警'
        ? `触发告警 / ${item.platformAction.alarmLevel}`
        : '无动作'}
    </td>
    <td className="px-4 py-3 border-b border-[#153B34]/50">
      <span className="inline-flex px-2 py-0.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-300">{item.priority}</span>
    </td>
    <td className="px-4 py-3 border-b border-[#153B34]/50 text-slate-400 leading-relaxed">{item.remark}</td>
    <td className="px-4 py-3 border-b border-[#153B34]/50 text-right">
      <button onClick={() => onEdit(item.id)} className="text-slate-500 hover:text-white p-1">
        <Edit3 size={14} />
      </button>
      <button onClick={() => onDuplicate(item.id)} className="text-slate-500 hover:text-blue-400 p-1 ml-1">
        <Copy size={14} />
      </button>
    </td>
  </tr>
);

const ConditionValueField = ({ condition, signalPoints, onChange }) => {
  const point = getPointOption(condition.deviceId, condition.pointCode, 'condition', signalPoints);
  const isTransitionRule = condition.rule === '变位';
  const isNumericRule = ['大于', '大于等于', '小于', '小于等于'].includes(condition.rule);
  const isEnumRule = ['等于', '不等于'].includes(condition.rule) && point?.valueType === 'enum' && point?.valueOptions?.length;

  if (isTransitionRule) {
    return (
      <select value={condition.value} onChange={(e) => onChange(e.target.value)} className="w-full bg-[#0C221E] border border-[#153B34] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00DFA2]">
        {transitionValueOptions.map((item) => (
          <option key={item} value={item}>{item}</option>
        ))}
      </select>
    );
  }

  if (isEnumRule) {
    return (
      <select value={condition.value} onChange={(e) => onChange(e.target.value)} className="w-full bg-[#0C221E] border border-[#153B34] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00DFA2]">
        {point.valueOptions.map((item) => (
          <option key={item} value={item}>{item}</option>
        ))}
      </select>
    );
  }

  return (
    <input
      type={isNumericRule ? 'number' : 'text'}
      value={condition.value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-[#0C221E] border border-[#153B34] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00DFA2]"
      placeholder={isNumericRule ? '请输入数值' : '请输入判断依据'}
    />
  );
};

const StrategyEditor = ({
  item,
  devices,
  signalPoints,
  onChangeField,
  onChangeCondition,
  onChangeAction,
  onChangePlatformAction,
  onAddCondition,
  onAddAction,
  onRemoveCondition,
  onRemoveAction,
  onOpenPointPicker,
  onMoveAction,
  onReorderAction,
}) => {
  const [dragActionIndex, setDragActionIndex] = useState(null);
  const sortedActions = [...item.deviceActions].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <div className="bg-[#0C221E] border border-[#153B34] rounded-xl p-5">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h5 className="text-white font-bold text-sm">基础信息</h5>
            <p className="text-[11px] text-slate-400 mt-1">策略级配置项包括名称、编码、优先级、逻辑模式和启用状态。</p>
          </div>
          <div className="flex items-center gap-3">
            <select value={item.logicMode} onChange={(e) => onChangeField('logicMode', e.target.value)} className="bg-[#081714] border border-[#153B34] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00DFA2]">
              <option value="AND">全部满足 AND</option>
              <option value="OR">任一满足 OR</option>
            </select>
            <button onClick={() => onChangeField('enabled', !item.enabled)} className={`w-11 h-6 rounded-full transition-colors relative ${item.enabled ? 'bg-[#00DFA2]' : 'bg-slate-700'}`}>
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${item.enabled ? 'left-5' : 'left-0.5'}`}></span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-4">
            <label className="block text-xs text-slate-400 mb-1.5">策略名称</label>
            <input type="text" value={item.name} onChange={(e) => onChangeField('name', e.target.value)} className="w-full bg-[#081714] border border-[#153B34] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00DFA2]" />
          </div>
          <div className="col-span-3">
            <label className="block text-xs text-slate-400 mb-1.5">策略编码</label>
            <input type="text" value={item.code} onChange={(e) => onChangeField('code', e.target.value)} className="w-full bg-[#081714] border border-[#153B34] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00DFA2]" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-slate-400 mb-1.5">优先级</label>
            <select value={item.priority} onChange={(e) => onChangeField('priority', e.target.value)} className="w-full bg-[#081714] border border-[#153B34] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00DFA2]">
              {priorityOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>
          <div className="col-span-3">
            <label className="block text-xs text-slate-400 mb-1.5">说明</label>
            <input type="text" value={item.remark} onChange={(e) => onChangeField('remark', e.target.value)} className="w-full bg-[#081714] border border-[#153B34] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00DFA2]" />
          </div>
        </div>
      </div>

      <div className="bg-[#0C221E] border border-[#153B34] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h5 className="text-white font-bold text-sm">判断条件</h5>
            <p className="text-[11px] text-slate-400 mt-1">先选设备，再通过点位弹窗选择故障点位、状态点位、数据项点位或已命名 DI/DO 点位。</p>
          </div>
          <button onClick={onAddCondition} className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#153B34] bg-[#081714] text-[#00DFA2] hover:text-white">
            <Plus size={14} />
            新增条件
          </button>
        </div>

        <div className="space-y-4">
          {item.conditions.map((condition, index) => (
            <div key={condition.id || `${item.id}-condition-${index}`} className="rounded-xl border border-[#153B34] bg-[#081714] p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-bold text-white">条件 {String(index + 1).padStart(2, '0')}</div>
                <button onClick={() => onRemoveCondition(index)} className="text-slate-500 hover:text-red-400 p-1">
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-3">
                  <label className="block text-xs text-slate-400 mb-1.5">设备</label>
                  <select value={condition.deviceId || ''} onChange={(e) => onChangeCondition(index, 'deviceId', e.target.value)} className="w-full bg-[#0C221E] border border-[#153B34] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00DFA2]">
                    <option value="">请选择设备</option>
                    {devices.map((device) => (
                      <option key={device.id} value={device.id}>{device.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-4">
                  <label className="block text-xs text-slate-400 mb-1.5">触点名称</label>
                  <button type="button" disabled={!condition.deviceId} onClick={() => onOpenPointPicker('condition', index, condition.deviceId, 'condition')} className="w-full bg-[#0C221E] border border-[#153B34] rounded-lg px-3 py-2.5 text-sm text-left text-white disabled:text-slate-500 disabled:cursor-not-allowed hover:border-[#00DFA2] transition-colors">
                    {condition.pointLabel ? `${condition.pointLabel} (${condition.pointCode})` : '选择点位'}
                  </button>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-slate-400 mb-1.5">判断规则</label>
                  <select value={condition.rule} onChange={(e) => onChangeCondition(index, 'rule', e.target.value)} className="w-full bg-[#0C221E] border border-[#153B34] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00DFA2]">
                    {conditionRuleOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-3">
                  <label className="block text-xs text-slate-400 mb-1.5">判断依据</label>
                  <ConditionValueField condition={condition} signalPoints={signalPoints} onChange={(value) => onChangeCondition(index, 'value', value)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#0C221E] border border-[#153B34] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h5 className="text-white font-bold text-sm">执行动作</h5>
            <p className="text-[11px] text-slate-400 mt-1">设备动作支持拖拽排序和前移/后移，平台动作单独配置告警行为与等级。</p>
          </div>
          <button onClick={onAddAction} className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#153B34] bg-[#081714] text-[#00DFA2] hover:text-white">
            <Plus size={14} />
            新增设备动作
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">设备动作</div>
          {sortedActions.map((action, index) => (
            <div
              key={action.id || `${item.id}-device-action-${index}`}
              draggable
              onDragStart={() => setDragActionIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragActionIndex !== null) onReorderAction(dragActionIndex, index);
                setDragActionIndex(null);
              }}
              onDragEnd={() => setDragActionIndex(null)}
              className="rounded-xl border border-[#153B34] bg-[#081714] p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <GripVertical size={16} className="text-slate-500 cursor-move" />
                  <span className="text-sm font-bold text-white">设备动作 {String(index + 1).padStart(2, '0')}</span>
                  <span className="px-2 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-[10px]">顺序 #{action.order}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => onMoveAction('device', index, 'up')} className="p-1.5 rounded border border-[#153B34] text-slate-400 hover:text-white">
                    <ArrowUp size={14} />
                  </button>
                  <button onClick={() => onMoveAction('device', index, 'down')} className="p-1.5 rounded border border-[#153B34] text-slate-400 hover:text-white">
                    <ArrowDown size={14} />
                  </button>
                  <button onClick={() => onRemoveAction(index)} className="p-1.5 rounded border border-[#153B34] text-slate-400 hover:text-red-400">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-3">
                  <label className="block text-xs text-slate-400 mb-1.5">设备</label>
                  <select value={action.deviceId || ''} onChange={(e) => onChangeAction(index, 'deviceId', e.target.value)} className="w-full bg-[#0C221E] border border-[#153B34] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00DFA2]">
                    <option value="">请选择设备</option>
                    {devices.map((device) => (
                      <option key={device.id} value={device.id}>{device.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-5">
                  <label className="block text-xs text-slate-400 mb-1.5">触发点位</label>
                  <button type="button" disabled={!action.deviceId} onClick={() => onOpenPointPicker('action', index, action.deviceId, 'action')} className="w-full bg-[#0C221E] border border-[#153B34] rounded-lg px-3 py-2.5 text-sm text-left text-white disabled:text-slate-500 disabled:cursor-not-allowed hover:border-[#00DFA2] transition-colors">
                    {action.pointLabel ? `${action.pointLabel} (${action.pointCode})` : '选择控制点位'}
                  </button>
                </div>
                <div className="col-span-4">
                  <label className="block text-xs text-slate-400 mb-1.5">对应动作</label>
                  <select value={action.command || ''} onChange={(e) => onChangeAction(index, 'command', e.target.value)} className="w-full bg-[#0C221E] border border-[#153B34] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00DFA2]">
                    <option value="">请选择动作</option>
                    {getCommandOptionsForAction(action, signalPoints).map((command) => (
                      <option key={command} value={command}>{command}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-[#153B34] bg-[#081714] p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-white">平台动作</span>
              <span className="px-2 py-0.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-[10px]">顺序 #{item.platformAction.order}</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => onMoveAction('platform', 0, 'up')} className="p-1.5 rounded border border-[#153B34] text-slate-400 hover:text-white">
                <ArrowUp size={14} />
              </button>
              <button onClick={() => onMoveAction('platform', 0, 'down')} className="p-1.5 rounded border border-[#153B34] text-slate-400 hover:text-white">
                <ArrowDown size={14} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-4">
              <label className="block text-xs text-slate-400 mb-1.5">平台动作</label>
              <select value={item.platformAction.type} onChange={(e) => onChangePlatformAction('type', e.target.value)} className="w-full bg-[#0C221E] border border-[#153B34] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00DFA2]">
                {platformActionTypeOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div className="col-span-4">
              <label className="block text-xs text-slate-400 mb-1.5">告警等级</label>
              <select disabled={item.platformAction.type !== '触发告警'} value={item.platformAction.alarmLevel || ''} onChange={(e) => onChangePlatformAction('alarmLevel', e.target.value)} className="w-full bg-[#0C221E] border border-[#153B34] rounded-lg px-3 py-2.5 text-sm text-white disabled:text-slate-500 focus:outline-none focus:border-[#00DFA2]">
                <option value="">不适用</option>
                {alarmLevelOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PointPickerPanel = ({ items, onSelect }) => {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#153B34] bg-[#081714] p-8 text-center text-sm text-slate-500">
        当前设备暂无可选点位。
      </div>
    );
  }

  const groups = items.reduce((acc, item) => {
    acc[item.pointCategory] = acc[item.pointCategory] || [];
    acc[item.pointCategory].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      {Object.entries(groups).map(([category, groupItems]) => (
        <div key={category} className="rounded-xl border border-[#153B34] overflow-hidden">
          <div className="px-4 py-3 bg-[#081714] border-b border-[#153B34] text-sm font-bold text-white">{category}</div>
          <div className="divide-y divide-[#153B34]">
            {groupItems.map((item) => (
              <button key={`${category}-${item.pointCode}`} onClick={() => onSelect(item)} className="w-full text-left px-4 py-3 bg-[#0C221E] hover:bg-[#102621] transition-colors">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-white font-medium">{item.pointLabel}</div>
                    <div className="text-[11px] text-slate-500 mt-1">{item.originModelName}</div>
                  </div>
                  <span className="font-mono text-[#00DFA2]">{item.pointCode}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const ConstraintStatusBadge = ({ status, accent }) => {
  const toneMap = {
    green: {
      运行中: 'border-[#00DFA2]/30 bg-[#00DFA2]/10 text-[#00DFA2]',
      已关闭: 'border-slate-600 bg-slate-700/20 text-slate-400',
      告警中: 'border-red-500/30 bg-red-500/10 text-red-300',
      待投入: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    },
    red: {
      运行中: 'border-red-500/30 bg-red-500/10 text-red-300',
      已关闭: 'border-slate-600 bg-slate-700/20 text-slate-400',
      告警中: 'border-red-500/30 bg-red-500/10 text-red-300',
      待投入: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    },
  };

  const className = toneMap[accent]?.[status] || 'border-slate-600 bg-slate-700/20 text-slate-300';
  return <span className={`px-2.5 py-1 rounded-full border text-[10px] font-medium ${className}`}>{status}</span>;
};

const L1CompactCard = ({ title, subtitle, icon, accent, config, onToggle, onOpen, summaryItems }) => (
  <div className="bg-[#0C221E] border border-[#153B34] rounded-xl p-6 shadow-lg">
    <div className="flex items-start justify-between gap-4 mb-6 border-b border-[#153B34] pb-4">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${accent === 'red' ? 'bg-red-500/10' : 'bg-[#00DFA2]/10'}`}>{icon}</div>
        <div>
          <h4 className="text-white font-bold">{title}</h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <ConstraintStatusBadge status={config.status} accent={accent} />
        <button onClick={onToggle} className={`w-11 h-6 rounded-full transition-colors relative ${config.enabled ? 'bg-[#00DFA2]' : 'bg-slate-700'}`}>
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${config.enabled ? 'left-5' : 'left-0.5'}`}></span>
        </button>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 mb-5">
      <div className="rounded-xl border border-[#153B34] bg-[#081714] p-4">
        <div className="text-[11px] text-slate-500 mb-2">最近动作</div>
        <div className="text-sm text-white font-medium">{config.latestAction}</div>
      </div>
      <div className="rounded-xl border border-[#153B34] bg-[#081714] p-4">
        <div className="text-[11px] text-slate-500 mb-2">最近触发时间</div>
        <div className="text-sm text-white font-medium">{config.lastActionAt}</div>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-4 mb-5">
      {summaryItems.map((item) => (
        <div key={item.label} className="rounded-xl border border-[#153B34] bg-[#081714] p-4">
          <div className="text-[11px] text-slate-500 mb-2">{item.label}</div>
          <div className="text-sm text-white font-medium">{item.value}</div>
        </div>
      ))}
    </div>

    <button onClick={onOpen} className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#00DFA2] to-[#10B981] text-[#051210] text-sm font-bold hover:brightness-110 transition-all">
      配置策略
    </button>
  </div>
);

const L1StrategyModal = ({ open, onClose, title, config, onChange, options, noteLines, chargerControl = false }) => {
  if (!open) return null;
  const chargerDisabled = chargerControl && !config.chargerControlEnabled;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-[760px] bg-[#0B2A57] border border-cyan-400/30 rounded-2xl shadow-[0_0_30px_rgba(34,211,238,0.12)] overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-cyan-500/20 bg-[#0A2146]">
          <div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <p className="text-xs text-cyan-100/70 mt-1">当前弹窗仅维护该策略自身参数，不再与其他 L1 策略共享切换。</p>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 bg-[#0B2A57] max-h-[78vh] overflow-y-auto">
          <div className="space-y-5 text-white">
            <div className="space-y-4 rounded-xl border border-cyan-400/20 bg-[#0A2146]/50 p-4">
              <div>
                <div className="text-sm font-bold text-white">{chargerControl ? '储能控制' : '基础控制'}</div>
                <div className="text-xs text-cyan-100/60 mt-1">{chargerControl ? '先通过储能充放电调节站级需量。' : '维护当前 L1 策略的核心执行参数。'}</div>
              </div>
              <div>
                <label className="block text-sm mb-1"><span className="text-red-400 mr-1">*</span>限制值</label>
                <div className="flex items-center gap-3">
                  <input value={config.limitValue} onChange={(e) => onChange('limitValue', e.target.value)} className="flex-1 bg-[#183F76] border border-[#4E75A8] rounded px-4 py-2.5 text-white focus:outline-none focus:border-cyan-400" />
                  <span className="text-slate-200">kW</span>
                </div>
                <p className="text-sm text-slate-300 mt-2">{title === '逆功率保护' ? '保护变压器功率不低于此值，建议设置为0。' : '保护变压器功率不超过此值，建议设置为变压器容量的90-95%。'}</p>
              </div>

              <div>
                <label className="block text-sm mb-1"><span className="text-red-400 mr-1">*</span>目标值</label>
                <div className="flex items-center gap-3">
                  <input value={config.targetValue} onChange={(e) => onChange('targetValue', e.target.value)} className="flex-1 bg-[#183F76] border border-[#4E75A8] rounded px-4 py-2.5 text-white focus:outline-none focus:border-cyan-400" />
                  <span className="text-slate-200">kW</span>
                </div>
                <p className="text-sm text-slate-300 mt-2">目标值用于给控制执行留缓冲，建议与限制值保留少量差值。</p>
              </div>

              <div>
                <label className="block text-sm mb-1"><span className="text-red-400 mr-1">*</span>保护程度</label>
                <select value={config.protectionLevel} onChange={(e) => onChange('protectionLevel', e.target.value)} className="w-full bg-[#183F76] border border-cyan-400 rounded px-4 py-2.5 text-white focus:outline-none">
                  {options.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
            </div>

            {chargerControl && (
              <div className="space-y-4 rounded-xl border border-blue-400/20 bg-blue-500/10 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-bold text-white">有序充电控制</div>
                    <div className="text-xs text-cyan-100/60 mt-1">在总需量逼近限制值时，对充电负荷做有序调度。</div>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-cyan-100">
                    <input
                      type="checkbox"
                      checked={Boolean(config.chargerControlEnabled)}
                      onChange={(e) => onChange('chargerControlEnabled', e.target.checked)}
                      className="accent-cyan-300"
                    />
                    启用
                  </label>
                </div>

                <div className={`grid grid-cols-2 gap-4 ${chargerDisabled ? 'opacity-45' : ''}`}>
                  <div className="col-span-2">
                    <label className="block text-sm mb-1">有序充电策略</label>
                    <select
                      disabled={chargerDisabled}
                      value={config.chargerControlMode}
                      onChange={(e) => onChange('chargerControlMode', e.target.value)}
                      className="w-full bg-[#183F76] border border-[#4E75A8] rounded px-4 py-2.5 text-white focus:outline-none focus:border-cyan-400 disabled:cursor-not-allowed"
                    >
                      <option value="按优先级降功率">按优先级降功率</option>
                      <option value="暂停新充电会话">暂停新充电会话</option>
                      <option value="降功率，必要时暂停新会话">降功率，必要时暂停新会话</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm mb-1">可调充电功率</label>
                    <div className="flex items-center gap-3">
                      <input
                        disabled={chargerDisabled}
                        value={config.chargerMaxPower}
                        onChange={(e) => onChange('chargerMaxPower', e.target.value)}
                        className="flex-1 bg-[#183F76] border border-[#4E75A8] rounded px-4 py-2.5 text-white focus:outline-none focus:border-cyan-400 disabled:cursor-not-allowed"
                      />
                      <span className="text-slate-200">kW</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm mb-1">最低服务功率</label>
                    <div className="flex items-center gap-3">
                      <input
                        disabled={chargerDisabled}
                        value={config.chargerMinPower}
                        onChange={(e) => onChange('chargerMinPower', e.target.value)}
                        className="flex-1 bg-[#183F76] border border-[#4E75A8] rounded px-4 py-2.5 text-white focus:outline-none focus:border-cyan-400 disabled:cursor-not-allowed"
                      />
                      <span className="text-slate-200">kW</span>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm mb-1">恢复等待时间</label>
                    <input
                      disabled={chargerDisabled}
                      value={config.chargerRecoveryDelay}
                      onChange={(e) => onChange('chargerRecoveryDelay', e.target.value)}
                      className="w-full bg-[#183F76] border border-[#4E75A8] rounded px-4 py-2.5 text-white focus:outline-none focus:border-cyan-400 disabled:cursor-not-allowed"
                    />
                    <p className="text-sm text-slate-300 mt-2">需量回落到目标值以下并持续达到该等待时间后，再逐步恢复有序充电功率。</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button onClick={onClose} className="px-6 py-2 text-sm text-slate-300 hover:text-white transition-colors">
                取消
              </button>
              <button onClick={onClose} className="px-6 py-2 bg-[#14D3C0] text-[#08345B] font-bold rounded hover:brightness-110 transition-all">
                保存
              </button>
            </div>

            <div className="text-sm text-slate-200 leading-relaxed">
              <div className="mb-1">说明：</div>
              {noteLines.map((line, index) => (
                <div key={line}>{index + 1}. {line}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricLite = ({ label, value, tone = 'default' }) => {
  const toneMap = {
    default: 'text-white border-[#153B34] bg-[#081714]',
    green: 'text-[#00DFA2] border-[#00DFA2]/30 bg-[#00DFA2]/10',
    amber: 'text-amber-300 border-amber-500/30 bg-amber-500/10',
  };

  return (
    <div className={`rounded-lg border p-3 ${toneMap[tone]}`}>
      <div className="text-[11px] text-slate-500 mb-1">{label}</div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
};

const PeakTemplateCard = ({ template, active, stats, onSelect, onEdit, onCopy }) => (
  <div
    className={`w-full text-left rounded-xl border p-4 transition-all ${
      active
        ? 'border-[#00DFA2] bg-[#00DFA2]/10 shadow-[0_0_15px_rgba(0,223,162,0.15)]'
        : 'border-[#153B34] bg-[#081714] hover:border-[#2b6459]'
    }`}
  >
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="text-white font-bold">{template.name}</div>
        <div className="text-[11px] text-slate-500 mt-1">共 {stats.total} 条时段，充电 {stats.charge} 条，放电 {stats.discharge} 条</div>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={onSelect} className="px-2 py-2 rounded-lg border border-[#153B34] text-[10px] text-slate-400 hover:text-white">
          查看
        </button>
        <button onClick={onEdit} className="p-2 rounded-lg border border-[#153B34] text-slate-400 hover:text-white">
          <Edit3 size={14} />
        </button>
        <button onClick={onCopy} className="p-2 rounded-lg border border-[#153B34] text-slate-400 hover:text-white">
          <Copy size={14} />
        </button>
      </div>
    </div>
  </div>
);

const PeakTemplateModal = ({
  mode,
  draft,
  error,
  onClose,
  onSave,
  onChangeField,
  onChangePeriod,
  onAddPeriod,
  onRemovePeriod,
  onOpenSmartPlan,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
    <div className="relative w-[980px] bg-gradient-to-br from-[#0C221E] to-[#081714] border border-[#00DFA2]/30 rounded-2xl shadow-[0_0_30px_rgba(0,223,162,0.12)] overflow-hidden">
      <div className="flex justify-between items-center px-6 py-4 border-b border-[#153B34] bg-[#051210]/50">
        <div>
          <h3 className="text-lg font-bold text-white">{mode === 'edit' ? '编辑充放电模板' : mode === 'copy' ? '复制充放电模板' : '新建充放电模板'}</h3>
          <p className="text-xs text-slate-400 mt-1">模板负责定义固定时段、动作与功率。功率正值自动识别为充电，负值自动识别为放电。</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5">
        <div>
          <label className="block text-xs text-slate-400 mb-1.5">模板名称</label>
          <input
            type="text"
            value={draft.name}
            onChange={(e) => onChangeField('name', e.target.value)}
            className="w-full bg-[#081714] border border-[#153B34] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00DFA2]"
            placeholder="请输入模板名称"
          />
        </div>

        <div className="rounded-xl border border-[#153B34] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#153B34] bg-[#081714] flex items-center justify-between">
            <div className="text-sm font-bold text-white">时段配置</div>
            <div className="flex items-center gap-2">
              <button onClick={onOpenSmartPlan} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-xs text-amber-300 hover:text-white">
                <Sparkles size={14} />
                智能规划策略
              </button>
              <button onClick={onAddPeriod} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#153B34] text-xs text-[#00DFA2] hover:text-white">
                <Plus size={14} />
                新增时段
              </button>
            </div>
          </div>
          <div className="divide-y divide-[#153B34]">
            {draft.periods.map((period, index) => (
              <div key={period.id} className="px-4 py-4 bg-[#0C221E]">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-bold text-white">时段 {String(index + 1).padStart(2, '0')}</div>
                  <button onClick={() => onRemovePeriod(period.id)} className="p-1.5 rounded border border-[#153B34] text-slate-400 hover:text-red-400">
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-3">
                    <label className="block text-xs text-slate-400 mb-1.5">开始时间</label>
                    <input type="time" value={period.start} onChange={(e) => onChangePeriod(period.id, 'start', e.target.value)} className="w-full bg-[#081714] border border-[#153B34] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00DFA2]" />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-xs text-slate-400 mb-1.5">结束时间</label>
                    <input type="time" value={period.end} onChange={(e) => onChangePeriod(period.id, 'end', e.target.value)} className="w-full bg-[#081714] border border-[#153B34] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00DFA2]" />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-xs text-slate-400 mb-1.5">动作</label>
                    <select value={period.action} onChange={(e) => onChangePeriod(period.id, 'action', e.target.value)} className="w-full bg-[#081714] border border-[#153B34] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00DFA2]">
                      <option value="charge">充电</option>
                      <option value="discharge">放电</option>
                    </select>
                  </div>
                  <div className="col-span-3">
                    <label className="block text-xs text-slate-400 mb-1.5">功率(kW)</label>
                    <input type="number" value={period.power} onChange={(e) => onChangePeriod(period.id, 'power', e.target.value)} className="w-full bg-[#081714] border border-[#153B34] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00DFA2]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}
      </div>

      <div className="border-t border-[#153B34] px-6 py-4 bg-[#051210]/50 flex justify-end gap-3">
        <button onClick={onClose} className="px-5 py-2 text-sm text-slate-300 hover:text-white transition-colors">
          取消
        </button>
        <button onClick={onSave} className="px-6 py-2 text-sm bg-gradient-to-r from-[#00DFA2] to-[#10B981] text-[#051210] font-bold rounded-lg shadow-lg hover:brightness-110 transition-all flex items-center gap-2">
          <Save size={16} />
          保存模板
        </button>
      </div>
    </div>
  </div>
);

const PeakStrategyChart = ({
  periods,
  priceBands,
  compact = false,
  tariffMode = 'fixed',
  fixedTariffPeriods = [],
  dynamicTariffRows = [],
  dynamicTariffGranularity = '96',
}) => {
  const chartPoints = buildPeakChartPoints(periods);
  const maxAbsPower = Math.max(100, ...chartPoints.map((item) => Math.abs(item.power)));
  const fixedSegments = (tariffMode === 'fixed' && fixedTariffPeriods.length > 0)
    ? fixedTariffPeriods.map((period) => ({
        label: period.level,
        start: period.start,
        end: period.end,
        price: period.price,
        color: getTariffLevelMeta(period.level).color,
      }))
    : priceBands;
  const dynamicPrices = dynamicTariffRows.map((row) => Number(row.price)).filter((price) => !Number.isNaN(price));
  const minDynamicPrice = Math.min(...dynamicPrices, 0);
  const maxDynamicPrice = Math.max(...dynamicPrices, 1);
  const dynamicRange = Math.max(maxDynamicPrice - minDynamicPrice, 0.1);

  const getX = (minutes) => (minutes / (24 * 60)) * 100;
  const getY = (power) => 50 - (power / maxAbsPower) * 32;
  const getPriceY = (price) => 82 - ((price - minDynamicPrice) / dynamicRange) * 58;
  const polyline = chartPoints.map((point) => `${getX(point.time)},${getY(point.power)}`).join(' ');
  const pricePolyline = buildIntervalStepPolyline(dynamicTariffRows, getPriceY);

  return (
    <div className="rounded-xl border border-[#153B34] bg-gradient-to-br from-[#081714] to-[#061613] p-4 shadow-inner">
      <div className={`flex items-center justify-between gap-4 ${compact ? 'mb-2' : 'mb-4'}`}>
        <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#00DFA2]"></span> 充电</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-amber-400"></span> 放电</span>
          {tariffMode === 'dynamic' ? (
            <>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-blue-400"></span> 市场电价</span>
              <span className="text-blue-300">动态 {dynamicTariffGranularity === '48' ? '48点/30分钟' : '96点/15分钟'}</span>
            </>
          ) : (
            tariffLevelOptions.map((level) => (
              <span key={level.value} className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm" style={{ background: level.color }}></span>{level.value}
              </span>
            ))
          )}
        </div>
        <div className="text-[11px] text-slate-500">{tariffMode === 'dynamic' ? '动态市场电价 + 功率曲线' : '固定分时电价 + 功率曲线'}</div>
      </div>

      <div className={`relative ${compact ? 'h-[210px]' : 'h-[280px]'}`}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
          <defs>
            <linearGradient id="peak-charge-gradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#00DFA2" stopOpacity="0.24" />
              <stop offset="100%" stopColor="#00DFA2" stopOpacity="0.03" />
            </linearGradient>
            <linearGradient id="peak-discharge-gradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.03" />
              <stop offset="100%" stopColor="#FBBF24" stopOpacity="0.24" />
            </linearGradient>
            <filter id="peak-line-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="0.65" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {tariffMode === 'dynamic' ? (
            dynamicTariffRows.map((row) => {
              const start = parseTimeToMinutes(row.start);
              const end = parseTimeToMinutes(row.end);
              return (
                <rect
                  key={`peak-dynamic-${row.id}`}
                  x={getX(start)}
                  y={76}
                  width={Math.max(0.15, getX(end) - getX(start))}
                  height={16}
                  fill="rgba(96,165,250,0.12)"
                />
              );
            })
          ) : (
            fixedSegments.map((band) => {
              const start = parseTimeToMinutes(band.start);
              const end = parseTimeToMinutes(band.end);
              return (
                <rect
                  key={`${band.label}-${band.start}`}
                  x={getX(start)}
                  y="0"
                  width={getX(end) - getX(start)}
                  height="100"
                  fill={band.color}
                />
              );
            })
          )}

          {periods.map((period) => {
            const start = parseTimeToMinutes(period.start);
            const end = parseTimeToMinutes(period.end);
            const power = Number(period.power);
            const y = power > 0 ? getY(power) : 50;
            const height = Math.abs(getY(power) - 50);
            return (
              <rect
                key={`power-area-${period.id}`}
                x={getX(start)}
                y={y}
                width={Math.max(0, getX(end) - getX(start))}
                height={height}
                fill={power > 0 ? 'url(#peak-charge-gradient)' : 'url(#peak-discharge-gradient)'}
              />
            );
          })}

          <line x1="0" y1="50" x2="100" y2="50" stroke="#244237" strokeWidth="0.4" />
          <line x1="0" y1="16" x2="100" y2="16" stroke="#1c312a" strokeWidth="0.3" strokeDasharray="1.5 1.5" />
          <line x1="0" y1="84" x2="100" y2="84" stroke="#1c312a" strokeWidth="0.3" strokeDasharray="1.5 1.5" />

          {Array.from({ length: 5 }, (_, index) => {
            const x = index * 25;
            return <line key={x} x1={x} y1="0" x2={x} y2="100" stroke="#173129" strokeWidth="0.25" />;
          })}

          {tariffMode === 'dynamic' && pricePolyline && (
            <polyline fill="none" stroke="#60A5FA" strokeWidth="0.55" strokeOpacity="0.8" points={pricePolyline} />
          )}

          <polyline
            fill="none"
            stroke="#00DFA2"
            strokeWidth={compact ? '0.95' : '0.78'}
            strokeLinejoin="miter"
            strokeLinecap="square"
            filter="url(#peak-line-glow)"
            points={polyline}
          />
        </svg>

        <div className="absolute inset-x-0 bottom-0 flex justify-between text-[10px] text-slate-500 px-1">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>24:00</span>
        </div>

        <div className="absolute left-0 top-2 bottom-6 flex flex-col justify-between text-[10px] text-slate-500">
          <span>{maxAbsPower}kW</span>
          <span>0</span>
          <span>-{maxAbsPower}kW</span>
        </div>
        {tariffMode === 'dynamic' && (
          <div className="absolute right-2 top-2 text-[10px] text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded px-2 py-1">
            电价 {minDynamicPrice.toFixed(3)} - {maxDynamicPrice.toFixed(3)} 元/kWh
          </div>
        )}
      </div>

      {tariffMode === 'dynamic' ? (
        <div className={`grid grid-cols-4 gap-2 ${compact ? 'mt-3' : 'mt-4'}`}>
          <div className="rounded-lg border border-[#153B34] bg-[#0C221E] px-3 py-2">
            <div className="text-[10px] text-slate-500">当前电价机制</div>
            <div className="text-xs text-white font-medium mt-1">动态市场化分时电价</div>
          </div>
          <div className="rounded-lg border border-[#153B34] bg-[#0C221E] px-3 py-2">
            <div className="text-[10px] text-slate-500">数据粒度</div>
            <div className="text-xs text-white font-medium mt-1">{dynamicTariffGranularity === '48' ? '48点 / 30分钟' : '96点 / 15分钟'}</div>
          </div>
          <div className="rounded-lg border border-[#153B34] bg-[#0C221E] px-3 py-2">
            <div className="text-[10px] text-slate-500">最低市场电价</div>
            <div className="text-xs text-cyan-300 font-medium mt-1">{minDynamicPrice.toFixed(4)} 元/kWh</div>
          </div>
          <div className="rounded-lg border border-[#153B34] bg-[#0C221E] px-3 py-2">
            <div className="text-[10px] text-slate-500">最高市场电价</div>
            <div className="text-xs text-red-300 font-medium mt-1">{maxDynamicPrice.toFixed(4)} 元/kWh</div>
          </div>
        </div>
      ) : (
        <div className={`grid grid-cols-6 gap-2 ${compact ? 'mt-3' : 'mt-4'}`}>
          {fixedSegments.slice(0, 6).map((band, index) => (
            <div key={`${band.label || band.value}-${band.start || index}-legend`} className="rounded-lg border border-[#153B34] bg-[#0C221E] px-3 py-2">
              <div className="text-[10px] text-slate-500">{band.start ? `${band.start} - ${band.end}` : '固定分时'}</div>
              <div className="text-xs text-white font-medium mt-1">{band.label || band.value}段电价{band.price ? ` / ${band.price}` : ''}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ForecastDateChip = ({ item, active, chipRef, onSelect }) => (
  <button
    ref={chipRef}
    onClick={onSelect}
    className={`min-w-[132px] rounded-lg border px-3 py-2 text-left transition-all ${
      active ? 'border-blue-400 bg-blue-500/10 shadow-[0_0_0_1px_rgba(96,165,250,0.25)]' : 'border-[#153B34] bg-[#081714] hover:border-[#256052]'
    }`}
  >
    <div className="flex items-center justify-between gap-2">
      <div className="text-xs font-bold text-white">{item.date.slice(5)}</div>
      <span className={`px-1.5 py-0.5 rounded border text-[10px] ${
        item.type === 'history'
          ? 'border-slate-500/30 bg-slate-500/10 text-slate-300'
          : item.type === 'today'
            ? 'border-[#00DFA2]/30 bg-[#00DFA2]/10 text-[#00DFA2]'
            : 'border-blue-500/30 bg-blue-500/10 text-blue-300'
      }`}>
        {item.type === 'history' ? '历史' : item.type === 'today' ? '今日' : '未来'}
      </span>
    </div>
    <div className="mt-2 flex items-end justify-between gap-3">
      <div>
        <div className="text-[10px] text-slate-500">平均电价</div>
        <div className="text-sm font-mono text-blue-200">{item.averagePrice.toFixed(4)}</div>
      </div>
      <div className="text-[10px] text-slate-500">{item.type === 'history' ? item.status : item.confidence}</div>
    </div>
  </button>
);

const EconomicForecastChart = ({ rows, plan, view, onViewChange }) => {
  const prices = rows.map((row) => Number(row.price)).filter((price) => !Number.isNaN(price));
  const minPrice = Math.min(...prices, 0);
  const maxPrice = Math.max(...prices, 1);
  const priceRange = Math.max(maxPrice - minPrice, 0.1);
  const getX = (minutes) => (minutes / 1440) * 100;
  const getPriceY = (price) => 74 - ((price - minPrice) / priceRange) * 52;
  const getPowerY = (power) => 50 - (Number(power) / 120) * 28;
  const priceLine = buildIntervalStepPolyline(rows, getPriceY);
  const planPoints = buildPeakChartPoints((plan?.periods || []).map((period) => ({
    ...period,
    power: period.action === '放电' ? -Math.abs(Number(period.power)) : Math.abs(Number(period.power)),
  }))).map((point) => `${getX(point.time)},${getPowerY(point.power)}`).join(' ');

  return (
    <div className="rounded-xl border border-[#153B34] bg-[#081714] p-4">
      <div className="flex items-center justify-between mb-3 gap-3 text-[11px] text-slate-400">
        <div className="flex items-center gap-2 rounded-lg border border-[#153B34] bg-[#0C221E] p-1">
          <button
            onClick={() => onViewChange('chart')}
            className={`px-3 py-1.5 rounded text-xs font-bold ${view === 'chart' ? 'bg-blue-400 text-[#051210]' : 'text-slate-400 hover:text-white'}`}
          >
            曲线
          </button>
          <button
            onClick={() => onViewChange('table')}
            className={`px-3 py-1.5 rounded text-xs font-bold ${view === 'table' ? 'bg-blue-400 text-[#051210]' : 'text-slate-400 hover:text-white'}`}
          >
            明细
          </button>
        </div>
        <span>最高 {maxPrice.toFixed(4)} / 最低 {minPrice.toFixed(4)} 元/kWh</span>
      </div>
      {view === 'chart' ? (
        <>
          <div className="flex items-center gap-4 mb-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-400"></span> 预测电价阶梯线</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#00DFA2]"></span> 自动生成策略功率</span>
          </div>
          <div className="relative h-60">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
              <defs>
                <linearGradient id="economic-price-area" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.20" />
                  <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.02" />
                </linearGradient>
                <linearGradient id="economic-plan-area" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#00DFA2" stopOpacity="0.14" />
                  <stop offset="100%" stopColor="#00DFA2" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              <line x1="0" y1="50" x2="100" y2="50" stroke="#244237" strokeWidth="0.4" />
              <line x1="0" y1="20" x2="100" y2="20" stroke="#1c312a" strokeWidth="0.3" strokeDasharray="1.5 1.5" />
              <line x1="0" y1="78" x2="100" y2="78" stroke="#1c312a" strokeWidth="0.3" strokeDasharray="1.5 1.5" />
              {Array.from({ length: 5 }, (_, index) => <line key={index} x1={index * 25} y1="0" x2={index * 25} y2="100" stroke="#173129" strokeWidth="0.25" />)}
              {priceLine && (
                <>
                  <polyline fill="none" stroke="rgba(96,165,250,0.14)" strokeWidth="1.8" strokeLinejoin="miter" strokeLinecap="butt" points={priceLine} />
                  <polyline fill="none" stroke="#60A5FA" strokeWidth="0.9" strokeLinejoin="miter" strokeLinecap="butt" points={priceLine} />
                </>
              )}
              {planPoints && <polyline fill="none" stroke="#00DFA2" strokeWidth="0.95" strokeLinejoin="miter" strokeLinecap="butt" points={planPoints} />}
            </svg>
            <div className="absolute inset-x-0 bottom-0 flex justify-between text-[10px] text-slate-500">
              <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-lg border border-[#153B34] overflow-hidden">
          <div className="px-3 py-2 border-b border-[#153B34] bg-[#0C221E] flex items-center justify-between">
            <div className="text-xs font-bold text-white">电价数据明细</div>
            <div className="text-[10px] text-slate-500">{rows.length} 条原始预测数据</div>
          </div>
          <div className="max-h-72 overflow-auto">
            <table className="w-full text-[11px] text-left">
              <thead className="sticky top-0 bg-[#081714] text-slate-500">
                <tr>
                  <th className="px-3 py-2 border-b border-[#153B34]">序号</th>
                  <th className="px-3 py-2 border-b border-[#153B34]">开始时间</th>
                  <th className="px-3 py-2 border-b border-[#153B34]">结束时间</th>
                  <th className="px-3 py-2 border-b border-[#153B34]">预测电价(元/kWh)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#153B34]">
                {rows.map((row, index) => (
                  <tr key={row.id} className="bg-[#0B1E1A]">
                    <td className="px-3 py-2 text-slate-400 font-mono">{String(index + 1).padStart(2, '0')}</td>
                    <td className="px-3 py-2 text-white font-mono">{row.start}</td>
                    <td className="px-3 py-2 text-white font-mono">{row.end}</td>
                    <td className="px-3 py-2 text-blue-300 font-mono">{Number(row.price).toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const EconomicPlanCard = ({
  forecast,
  plan,
  editMode,
  draft,
  error,
  onGenerate,
  onEdit,
  onCancel,
  onSave,
  onPublish,
  onRun,
  onChangePeriod,
}) => {
  const viewPlan = editMode ? draft : plan;
  return (
    <div className="rounded-xl border border-[#153B34] bg-[#081714] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#153B34] flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-bold text-white">{forecast.date}</div>
          <div className="text-[11px] text-slate-500 mt-1">{viewPlan?.priceSource || forecast.source} / {viewPlan?.status || '未生成'}</div>
        </div>
        <span className="px-2 py-0.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-[10px]">
          {forecast.type === 'history' ? '历史策略' : forecast.type === 'today' ? '今日策略' : '未来策略'}
        </span>
      </div>
      {!viewPlan ? (
        <div className="p-4">
          <div className="text-[11px] text-slate-500 mb-3">该日暂无策略，系统可按当前预测电价和储能边界生成一版策略。</div>
          <button onClick={onGenerate} className="w-full py-2 rounded-lg bg-[#00DFA2] text-[#051210] text-xs font-bold">系统生成策略</button>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <StatusCell label="预计收益" value={`${viewPlan.estimatedRevenue} 元`} tone="green" />
            <StatusCell label="节省成本" value={`${viewPlan.estimatedCostSaving} 元`} tone="amber" />
          </div>
          <div className="rounded-lg border border-[#153B34] overflow-hidden">
            <table className="w-full text-[11px] text-left">
              <thead className="bg-[#0C221E] text-slate-500">
                <tr>
                  <th className="px-2 py-2">时段</th>
                  <th className="px-2 py-2">动作</th>
                  <th className="px-2 py-2">功率</th>
                  <th className="px-2 py-2">SOC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#153B34]">
                {viewPlan.periods.map((period) => (
                  <tr key={period.id}>
                    <td className="px-2 py-2">
                      {editMode ? (
                        <div className="flex gap-1">
                          <input type="time" value={period.start} onChange={(event) => onChangePeriod(period.id, 'start', event.target.value)} className="w-20 bg-[#0C221E] border border-[#153B34] rounded px-1 py-1 text-white" />
                          <input type="time" value={period.end} onChange={(event) => onChangePeriod(period.id, 'end', event.target.value)} className="w-20 bg-[#0C221E] border border-[#153B34] rounded px-1 py-1 text-white" />
                        </div>
                      ) : `${period.start}-${period.end}`}
                    </td>
                    <td className="px-2 py-2">
                      {editMode ? (
                        <select value={period.action} onChange={(event) => onChangePeriod(period.id, 'action', event.target.value)} className="bg-[#0C221E] border border-[#153B34] rounded px-1 py-1 text-white">
                          <option value="充电">充电</option>
                          <option value="放电">放电</option>
                        </select>
                      ) : period.action}
                    </td>
                    <td className="px-2 py-2">
                      {editMode ? (
                        <input type="number" value={Math.abs(Number(period.power) || 0)} onChange={(event) => onChangePeriod(period.id, 'power', event.target.value)} className="w-20 bg-[#0C221E] border border-[#153B34] rounded px-1 py-1 text-white" />
                      ) : <span className={Number(period.power) >= 0 ? 'text-[#00DFA2]' : 'text-amber-300'}>{period.power} kW</span>}
                    </td>
                    <td className="px-2 py-2 text-slate-400">{period.socStart}%→{period.socEnd}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-[11px] text-slate-500 leading-relaxed">{viewPlan.constraintSummary}</div>
          {error && <div className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</div>}
          <div className="flex flex-wrap justify-end gap-2">
            {editMode ? (
              <>
                <button onClick={onCancel} className="px-3 py-1.5 rounded border border-[#153B34] text-xs text-slate-300">取消</button>
                <button onClick={onSave} className="px-3 py-1.5 rounded bg-[#00DFA2] text-[#051210] text-xs font-bold">保存</button>
              </>
            ) : (
              <>
                {forecast.type !== 'history' && (
                  <button onClick={onGenerate} className="px-3 py-1.5 rounded border border-[#153B34] text-xs text-slate-300">系统重新生成</button>
                )}
                <button onClick={onEdit} className="px-3 py-1.5 rounded border border-[#153B34] text-xs text-slate-300">{forecast.type === 'history' ? '历史修正' : '人工调整'}</button>
                <button onClick={onPublish} disabled={!['待审核', '已保存'].includes(viewPlan.status)} className="px-3 py-1.5 rounded bg-[#00DFA2] text-[#051210] text-xs font-bold disabled:opacity-40">发布策略</button>
                <button onClick={onRun} disabled={!['已发布', '已运行', '已回归'].includes(viewPlan.status)} className="px-3 py-1.5 rounded border border-blue-500/30 text-xs text-blue-300 disabled:opacity-40">标记运行</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const RegressionPanel = ({ report, onOpenDetail }) => {
  if (!report) {
    return (
      <div className="px-5 py-3 text-xs text-slate-500">
        请选择已运行日期并生成回归分析。
      </div>
    );
  }
  return (
    <div className="p-4 space-y-3">
      <div className="grid grid-cols-5 gap-3">
        <MetricLite label="预计收益" value={`${report.plannedRevenue.toFixed(2)} 元`} />
        <MetricLite label="实际收益" value={`${report.actualRevenue.toFixed(2)} 元`} tone="green" />
        <MetricLite label="收益偏差" value={`${report.deviationRate}%`} tone={report.deviationRate >= 0 ? 'green' : 'amber'} />
        <MetricLite label="功率偏差" value={report.powerDeviation} />
        <MetricLite label="SOC偏差" value={report.socDeviation} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <StatusCell label="电价预测偏差" value={report.priceDeviation} />
        <StatusCell label="功率限幅次数" value={`${report.limitCount} 次`} tone="amber" />
        <StatusCell label="手动修改影响" value={report.manualImpact} tone="green" />
      </div>
      <div className="rounded-lg border border-[#153B34] bg-[#081714] px-4 py-3 flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-bold text-white">下一次策略建议</div>
          <div className="text-xs text-slate-400 mt-1">{report.suggestion}</div>
        </div>
        <button onClick={onOpenDetail} className="px-3 py-2 rounded-lg border border-[#153B34] text-xs text-[#00DFA2] hover:text-white">查看偏差明细</button>
      </div>
    </div>
  );
};

const GridSwitchControl = ({ config, onChangeTopology, onRequestSwitch }) => {
  const currentMeta = getGridSwitchModeMeta(config.mode);
  const nextTarget = currentMeta.target;
  const nextMeta = getGridSwitchModeMeta(nextTarget);
  const nextSteps = getGridSwitchSteps(config.topology, nextTarget);
  const topologyMeta = gridSwitchTopologyOptions.find((item) => item.id === config.topology) || gridSwitchTopologyOptions[0];

  return (
    <div className="bg-[#0C221E] border border-[#153B34] rounded-xl overflow-hidden shadow-lg">
      <div className="px-5 py-4 border-b border-[#153B34] bg-[#081714]/60 flex items-center justify-between gap-4">
        <div>
          <h4 className="text-white font-bold text-base flex items-center gap-2">
            <GitBranch size={18} className="text-[#00DFA2]" />
            并离网切换控制
          </h4>
          <p className="text-xs text-slate-500 mt-1">根据现场是否配置 STS，展示并网/离网切换链路、前置条件和执行步骤。</p>
        </div>
        <div className="flex rounded-lg border border-[#153B34] bg-[#081714] p-1">
          {gridSwitchTopologyOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => onChangeTopology(option.id)}
              className={`px-3 py-1.5 rounded text-xs font-bold ${config.topology === option.id ? 'bg-[#00DFA2] text-[#051210]' : 'text-slate-400 hover:text-white'}`}
            >
              {option.shortLabel}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 grid grid-cols-12 gap-5">
        <div className="col-span-7 rounded-xl border border-[#153B34] bg-[#081714] p-4">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <div className="text-sm font-bold text-white">{topologyMeta.label}</div>
              <div className="text-[11px] text-slate-500 mt-1">{config.topology === 'with_sts' ? 'STS 与 PCS 联合完成快速切换，EMS 负责监测和策略恢复。' : 'EMS 编排 QF 与 PCS 操作，按顺序完成并离网切换。'}</div>
            </div>
            <span className={`px-2 py-1 rounded border text-[10px] ${config.mode === 'grid' ? 'border-[#00DFA2]/30 bg-[#00DFA2]/10 text-[#00DFA2]' : 'border-amber-500/30 bg-amber-500/10 text-amber-300'}`}>
              {currentMeta.label}
            </span>
          </div>

          <GridSwitchTopologyDiagram config={config} />

          <div className="grid grid-cols-4 gap-3 mt-4">
            <StatusCell label="SOC" value={config.soc} tone="green" />
            <StatusCell label="PCS模式" value={config.pcsStatus} />
            <StatusCell label="QF1" value={config.qf1Status} tone={config.qf1Status === '合闸' ? 'green' : 'amber'} />
            <StatusCell label={config.topology === 'with_sts' ? 'STS' : 'QF2'} value={config.topology === 'with_sts' ? config.stsStatus : config.qf2Status} />
          </div>
        </div>

        <div className="col-span-5 rounded-xl border border-[#153B34] bg-[#081714] p-4 flex flex-col">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <div className="text-sm font-bold text-white">下一次切换步骤</div>
              <div className="text-[11px] text-slate-500 mt-1">目标：{nextMeta.label} / 最近切换：{config.lastSwitchAt}</div>
            </div>
            <button onClick={() => onRequestSwitch(nextTarget)} className="px-3 py-2 rounded-lg bg-[#00DFA2] text-[#051210] text-xs font-bold">
              {currentMeta.actionLabel}
            </button>
          </div>

          <div className="space-y-3 flex-1">
            {nextSteps.map((step, index) => (
              <div key={step} className="flex items-center gap-3">
                <div className="h-7 w-7 rounded-full border border-[#00DFA2]/30 bg-[#00DFA2]/10 text-[#00DFA2] flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 rounded-lg border border-[#153B34] bg-[#0C221E] px-3 py-2 text-xs text-slate-300">{step}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-[11px] text-blue-200">
            {config.topology === 'with_sts' ? '含 STS 场景下，切换速度由 STS 与 PCS 协同保障，EMS 聚焦状态确认和策略恢复。' : '不含 STS 场景下，EMS 需要明确开关与 PCS 模式切换顺序，避免非同期并网。'}
          </div>
        </div>
      </div>
    </div>
  );
};

const GridSwitchTopologyDiagram = ({ config }) => {
  const hasSts = config.topology === 'with_sts';
  const nodes = hasSts
    ? [
        { label: '电网', status: config.gridStatus },
        { label: 'QF1', status: config.qf1Status },
        { label: 'STS', status: config.stsStatus },
        { label: 'QF2', status: config.qf2Status },
        { label: 'PCS', status: config.pcsStatus },
        { label: '电池', status: config.soc },
      ]
    : [
        { label: '电网', status: config.gridStatus },
        { label: 'QF1', status: config.qf1Status },
        { label: '负载母线', status: '带载' },
        { label: 'QF2', status: config.qf2Status },
        { label: 'PCS', status: config.pcsStatus },
        { label: '电池', status: config.soc },
      ];

  return (
    <div className="rounded-lg border border-[#153B34] bg-[#051210] px-4 py-5">
      <div className="grid grid-cols-6 gap-2 items-center">
        {nodes.map((node, index) => (
          <div key={`${node.label}-${index}`} className="relative">
            {index > 0 && <div className="absolute top-6 -left-2 h-px w-4 bg-[#2e5f52]"></div>}
            <div className={`rounded-lg border px-2 py-2 text-center min-h-[64px] flex flex-col justify-center ${
              node.status === '分闸' ? 'border-amber-500/40 bg-amber-500/10' : 'border-[#153B34] bg-[#081714]'
            }`}>
              <div className="text-xs font-bold text-white">{node.label}</div>
              <div className="text-[10px] text-slate-500 mt-1">{node.status}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-[11px] text-slate-500">
        <div className="rounded border border-[#153B34] bg-[#081714] px-3 py-2">负荷：关键负载优先供电</div>
        <div className="rounded border border-[#153B34] bg-[#081714] px-3 py-2">保护：SOC、PCS、开关状态联锁</div>
      </div>
    </div>
  );
};

const getStrategyMonitorLogs = (item) => {
  if (!item) return [];
  return [
    { time: item.updatedAt || '刚刚', type: '执行', content: item.latestAction || '策略运行状态刷新。' },
    { time: '5分钟前', type: '触发', content: `${item.name} 根据 ${item.target} 状态进入判断。` },
    { time: '12分钟前', type: item.status.includes('告警') ? '告警' : '恢复', content: `${item.layer} 约束校验完成，当前状态：${item.status}。` },
    { time: '今日 08:30:00', type: '人工操作', content: `${item.name} 配置已加载到边缘EMS。` },
  ];
};

const getStrategyLayerLogs = (layerItem, layerItems) => {
  if (!layerItem) return [];
  const activeNames = layerItems.map((item) => item.name).join('、') || '暂无策略';
  const warningCount = layerItems.filter((item) => item.status.includes('告警')).length;
  return [
    { time: layerItem.updatedAt || '刚刚', type: '执行', content: `${layerItem.name} 当前纳管 ${layerItems.length} 项：${activeNames}。` },
    { time: '3分钟前', type: warningCount > 0 ? '告警' : '恢复', content: warningCount > 0 ? `该层存在 ${warningCount} 项告警策略，安全约束优先接管。` : `${layerItem.layer} 汇总校验正常，未发现阻断项。` },
    { time: '8分钟前', type: '触发', content: `${layerItem.layer} 已刷新与上下层策略的执行链路。` },
    { time: '今日 08:30:00', type: '人工操作', content: `${layerItem.layer} 运行拓扑已加载到策略监控视图。` },
  ];
};

const StrategyMonitorPage = ({ items, selectedId, onSelect }) => {
  const groupedItems = items.reduce((acc, item) => {
    acc[item.layer] = acc[item.layer] || [];
    acc[item.layer].push(item);
    return acc;
  }, {});
  const selectedLayerName = selectedId?.startsWith('layer:') ? selectedId.replace('layer:', '') : '';
  const selectedLayerItems = selectedLayerName ? groupedItems[selectedLayerName] || [] : [];
  const selectedItem = selectedLayerName
    ? {
        id: selectedId,
        layer: selectedLayerName,
        name: `${selectedLayerName} 汇总`,
        status: selectedLayerItems.some((item) => item.status.includes('告警')) ? '存在告警' : '运行中',
        target: selectedLayerItems.map((item) => item.target).join('、') || '策略链路',
        latestAction: `${selectedLayerItems.length} 项策略处于监控视图中`,
        updatedAt: selectedLayerItems[0]?.updatedAt || '刚刚',
      }
    : items.find((item) => item.id === selectedId) || items[0];
  const logs = selectedLayerName ? getStrategyLayerLogs(selectedItem, selectedLayerItems) : getStrategyMonitorLogs(selectedItem);

  return (
    <div className="grid grid-cols-12 gap-5 animate-in fade-in slide-in-from-bottom-4">
      <div className="col-span-9 space-y-4">
        <div className="bg-[#0C221E] border border-[#153B34] rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h4 className="text-white font-bold text-base flex items-center gap-2">
                <Activity size={18} className="text-[#00DFA2]" />
                L3→L0 策略约束监控
              </h4>
              <p className="text-xs text-slate-500 mt-1">只展示当前已启用、已配置或正在运行的策略，便于理解策略执行链路。</p>
            </div>
            <div className="grid grid-cols-3 gap-2 min-w-[280px]">
              <MetricLite label="运行策略" value={String(items.length)} tone="green" />
              <MetricLite label="告警策略" value={String(items.filter((item) => item.status.includes('告警')).length)} tone="amber" />
              <MetricLite label="层级" value="L3→L0" />
            </div>
          </div>
        </div>
        <StrategyTopologyGraph
          groupedItems={groupedItems}
          selectedId={selectedItem?.id}
          onSelect={onSelect}
        />
      </div>

      <div className="col-span-3 bg-[#0C221E] border border-[#153B34] rounded-xl overflow-hidden shadow-lg self-start sticky top-4">
        <div className="px-5 py-4 border-b border-[#153B34] bg-[#081714]/60">
          <div className="text-sm font-bold text-white">策略日志详情</div>
          <div className="text-[11px] text-slate-500 mt-1">{selectedItem?.name || '暂无策略'}</div>
        </div>
        <div className="p-4 space-y-3">
          {logs.map((log, index) => (
            <div key={`${log.time}-${index}`} className="rounded-lg border border-[#153B34] bg-[#081714] p-3">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] text-slate-500">{log.time}</span>
                <span className="px-2 py-0.5 rounded border border-blue-500/30 bg-blue-500/10 text-blue-300 text-[10px]">{log.type}</span>
              </div>
              <div className="text-xs text-slate-300 leading-relaxed">{log.content}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StrategyTopologyGraph = ({ groupedItems, selectedId, onSelect }) => {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const l0Items = groupedItems['L0 环境联锁'] || [];
  const l1Items = groupedItems['L1 硬性约束'] || [];
  const l2Items = groupedItems['L2 模式/并离网'] || [];
  const l3Items = groupedItems['L3 智能策略'] || [];
  const deviceNodes = [
    { id: 'pcs', label: 'PCS', detail: '充放电 / VF/PQ', color: '#00DFA2' },
    { id: 'pv', label: '光伏', detail: '逆变器 / 限发', color: '#FBBF24' },
    { id: 'charger', label: '有序充电', detail: '降功率 / 暂停新会话', color: '#60A5FA' },
    { id: 'load', label: '可控负荷', detail: '移峰 / 降载', color: '#C084FC' },
    { id: 'switch', label: 'QF/STS', detail: '并离网边界', color: '#FB7185' },
  ];
  const activeWarnings = [...l0Items, ...l1Items, ...l2Items, ...l3Items].filter((item) => item.status.includes('告警')).length;
  const isLayerActive = (layer) => selectedId === `layer:${layer}`;

  return (
    <div className="relative bg-[#061713] border border-[#153B34] rounded-2xl shadow-[0_24px_70px_rgba(0,0,0,0.35)] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(0,223,162,0.15),transparent_28%),radial-gradient(circle_at_82%_28%,rgba(96,165,250,0.13),transparent_28%),linear-gradient(rgba(21,59,52,0.24)_1px,transparent_1px),linear-gradient(90deg,rgba(21,59,52,0.24)_1px,transparent_1px)] bg-[size:auto,auto,36px_36px,36px_36px]"></div>
      <div className="relative px-5 py-4 border-b border-[#153B34] bg-[#051210]/70 flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <GitBranch size={17} className="text-[#00DFA2]" />
            动态策略拓扑
          </div>
          <div className="text-[11px] text-slate-500 mt-1">L3 生成策略后，依次经过 L2 控制边界、L1 硬性约束和 L0 动环联锁校验，再下发到设备执行。</div>
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <button
            onClick={() => setShowDetailModal(true)}
            className="px-2.5 py-1 rounded-full border border-blue-400/30 bg-blue-400/10 text-blue-200 hover:border-blue-300"
          >
            展开全量策略
          </button>
          <span className="px-2.5 py-1 rounded-full border border-[#00DFA2]/30 bg-[#00DFA2]/10 text-[#00DFA2]">实时链路</span>
          <span className={`px-2.5 py-1 rounded-full border ${activeWarnings > 0 ? 'border-amber-500/30 bg-amber-500/10 text-amber-300' : 'border-[#153B34] bg-[#081714] text-slate-400'}`}>
            告警 {activeWarnings}
          </span>
        </div>
      </div>

      <div className="relative p-5 overflow-x-auto">
        <div className="min-w-[1140px]">
          <div className="grid grid-cols-[180px_52px_180px_52px_180px_52px_180px_52px_150px] items-center">
            <StrategyFlowLayerCard
              layer="L3 智能策略"
              title="策略生成"
              subtitle="计划曲线 / 经济调度 / 削峰填谷"
              items={l3Items}
              active={isLayerActive('L3 智能策略')}
              selectedId={selectedId}
              onSelect={onSelect}
              accent="green"
              compact
            />

            <StrategyFlowConnector label="下发" />

            <StrategyFlowLayerCard
              layer="L2 模式/并离网"
              title="控制边界"
              subtitle="模式 / 并离网 / 控制权"
              items={l2Items}
              active={isLayerActive('L2 模式/并离网')}
              selectedId={selectedId}
              onSelect={onSelect}
              accent="blue"
              compact
            />

            <StrategyFlowConnector label="边界" />

            <StrategyFlowLayerCard
              layer="L1 硬性约束"
              title="硬约束修正"
              subtitle="防逆流 / 需量 / 有序充电"
              items={l1Items}
              active={isLayerActive('L1 硬性约束')}
              selectedId={selectedId}
              onSelect={onSelect}
              accent="amber"
              compact
            />

            <StrategyFlowConnector label="约束" tone="amber" />

            <StrategyFlowLayerCard
              layer="L0 环境联锁"
              title="联锁放行"
              subtitle="消防 / 门禁 / 温湿度"
              items={l0Items}
              active={isLayerActive('L0 环境联锁')}
              selectedId={selectedId}
              onSelect={onSelect}
              accent="red"
              compact
            />

            <StrategyFlowConnector label="放行" tone="amber" />

            <div>
              <button
                onClick={() => onSelect('layer:L3 智能策略')}
                className="w-full rounded-2xl border border-blue-400/25 bg-[#071d24]/90 px-3 py-3 text-left mb-3 hover:border-blue-300/70"
              >
                <div className="text-[11px] font-bold text-blue-300">ACTUATORS</div>
                <div className="text-sm font-bold text-white mt-1">设备执行对象</div>
              </button>
              <div className="grid grid-cols-1 gap-2">
                {deviceNodes.map((node) => (
                  <StrategyExecutionTargetNode key={node.id} node={node} />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-[#153B34] bg-[#081714]/80 px-4 py-3 backdrop-blur-sm">
            <div className="grid grid-cols-5 gap-3 text-[11px]">
              <div>
                <div className="text-slate-500 mb-1">01 策略生成</div>
                <div className="text-slate-300">L3 生成计划或优化功率</div>
              </div>
              <div>
                <div className="text-slate-500 mb-1">02 控制边界</div>
                <div className="text-slate-300">L2 决定本地/远方/并离网</div>
              </div>
              <div>
                <div className="text-slate-500 mb-1">03 硬约束修正</div>
                <div className="text-slate-300">L1 限制逆流、需量和充电负荷</div>
              </div>
              <div>
                <div className="text-slate-500 mb-1">04 联锁放行</div>
                <div className="text-slate-300">L0 根据动环状态最终拦截或放行</div>
              </div>
              <div>
                <div className="text-slate-500 mb-1">05 执行反馈</div>
                <div className="text-slate-300">设备状态回流到日志</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showDetailModal && (
        <StrategyTopologyDetailModal
          groupedItems={groupedItems}
          selectedId={selectedId}
          onSelect={onSelect}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </div>
  );
};

const StrategyFlowLayerCard = ({ layer, title, subtitle, items, active, selectedId, onSelect, accent, compact = false }) => {
  const visibleItems = items.slice(0, compact ? 1 : 2);
  const warning = items.some((item) => item.status.includes('告警'));
  const toneClass = {
    green: active ? 'border-[#00DFA2] bg-[#00DFA2]/14' : 'border-[#00DFA2]/25 bg-[#071b17]/92 hover:border-[#00DFA2]/70',
    amber: active ? 'border-amber-400 bg-amber-500/14' : 'border-amber-500/25 bg-[#161a10]/92 hover:border-amber-400/70',
    blue: active ? 'border-blue-300 bg-blue-400/15' : 'border-blue-400/25 bg-[#071d24]/92 hover:border-blue-300/70',
    red: active ? 'border-rose-300 bg-rose-500/14' : 'border-rose-500/25 bg-[#1b0f13]/92 hover:border-rose-300/70',
  }[accent];
  const labelTone = accent === 'amber' ? 'text-amber-300' : accent === 'blue' ? 'text-blue-300' : accent === 'red' ? 'text-rose-300' : 'text-[#00DFA2]';

  return (
    <div className={`rounded-3xl border px-4 py-4 transition-all shadow-[0_16px_40px_rgba(0,0,0,0.22)] ${toneClass}`}>
      <button onClick={() => onSelect(`layer:${layer}`)} className="w-full text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className={`text-[11px] font-bold truncate ${labelTone}`}>{layer}</div>
            <div className="text-lg font-bold text-white mt-1 whitespace-nowrap">{title}</div>
            <div className="text-[10px] text-slate-500 mt-1 truncate">{subtitle}</div>
          </div>
          <div className={`px-2 py-1 rounded-full border text-[10px] shrink-0 ${warning ? 'border-amber-500/30 bg-amber-500/10 text-amber-300' : 'border-[#00DFA2]/25 bg-[#00DFA2]/10 text-[#00DFA2]'}`}>
            {items.length}项
          </div>
        </div>
      </button>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {visibleItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`max-w-full truncate rounded-full border px-2 py-1 text-[10px] ${
              selectedId === item.id ? 'border-[#00DFA2] bg-[#00DFA2]/15 text-[#00DFA2]' : 'border-[#153B34] bg-[#061713]/75 text-slate-400 hover:text-slate-200'
            }`}
          >
            {item.name}
          </button>
        ))}
        {items.length > visibleItems.length && (
          <button
            onClick={() => onSelect(`layer:${layer}`)}
            className="rounded-full border border-dashed border-[#153B34] px-2 py-1 text-[10px] text-slate-500 hover:text-slate-300"
          >
            +{items.length - visibleItems.length}
          </button>
        )}
      </div>
    </div>
  );
};

const StrategyFlowConnector = ({ label, tone = 'green' }) => (
  <div className="flex flex-col items-center justify-center px-2">
    <div className={`h-px w-full ${tone === 'amber' ? 'bg-amber-400/60' : 'bg-[#00DFA2]/55'} shadow-[0_0_14px_currentColor]`}></div>
    <div className={`mt-2 text-[10px] font-bold ${tone === 'amber' ? 'text-amber-300' : 'text-[#00DFA2]'}`}>{label}</div>
    <div className={`mt-2 h-2 w-2 rotate-45 border-r border-t ${tone === 'amber' ? 'border-amber-300' : 'border-[#00DFA2]'}`}></div>
  </div>
);

const StrategyOverviewNode = ({ node, active, selectedId, onSelect, compact = false }) => {
  const visibleItems = node.items.slice(0, compact ? 1 : 2);
  const warning = node.items.some((item) => item.status.includes('告警'));
  const accentMap = {
    green: active ? 'border-[#00DFA2] bg-[#00DFA2]/14' : 'border-[#00DFA2]/25 bg-[#071b17]/92 hover:border-[#00DFA2]/70',
    amber: active ? 'border-amber-400 bg-amber-500/14' : 'border-amber-500/25 bg-[#161a10]/92 hover:border-amber-400/70',
    blue: active ? 'border-blue-300 bg-blue-400/15' : 'border-blue-400/25 bg-[#071d24]/92 hover:border-blue-300/70',
  };
  const labelTone = node.accent === 'amber' ? 'text-amber-300' : node.accent === 'blue' ? 'text-blue-300' : 'text-[#00DFA2]';

  return (
    <button
      onClick={() => onSelect(`layer:${node.layer}`)}
      className={`absolute ${node.className} rounded-3xl border px-4 py-4 text-left transition-all shadow-[0_16px_40px_rgba(0,0,0,0.22)] ${accentMap[node.accent]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className={`text-[11px] font-bold ${labelTone}`}>{node.layer}</div>
          <div className={`${compact ? 'text-base' : 'text-lg'} font-bold text-white mt-1`}>{node.title}</div>
          <div className="text-[10px] text-slate-500 mt-1">{node.subtitle}</div>
        </div>
        <div className={`px-2 py-1 rounded-full border text-[10px] shrink-0 ${warning ? 'border-amber-500/30 bg-amber-500/10 text-amber-300' : 'border-[#00DFA2]/25 bg-[#00DFA2]/10 text-[#00DFA2]'}`}>
          {node.items.length}项
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {visibleItems.map((item) => (
          <span
            key={item.id}
            onClick={(event) => {
              event.stopPropagation();
              onSelect(item.id);
            }}
            className={`max-w-full truncate rounded-full border px-2 py-1 text-[10px] ${
              selectedId === item.id ? 'border-[#00DFA2] bg-[#00DFA2]/15 text-[#00DFA2]' : 'border-[#153B34] bg-[#061713]/75 text-slate-400'
            }`}
          >
            {item.name}
          </span>
        ))}
        {node.items.length > visibleItems.length && (
          <span className="rounded-full border border-dashed border-[#153B34] px-2 py-1 text-[10px] text-slate-500">
            +{node.items.length - visibleItems.length}
          </span>
        )}
      </div>
    </button>
  );
};

const StrategyTopologyDetailModal = ({ groupedItems, selectedId, onSelect, onClose }) => {
  const layerOrder = ['L3 智能策略', 'L2 模式/并离网', 'L1 硬性约束', 'L0 环境联锁'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-[1100px] max-w-[94vw] max-h-[86vh] rounded-2xl border border-[#00DFA2]/25 bg-[#071713] shadow-[0_30px_90px_rgba(0,0,0,0.45)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#153B34] bg-[#051210]/70 flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-white">全量策略拓扑明细</div>
            <div className="text-xs text-slate-500 mt-1">主拓扑只保留运行链路概览，完整策略节点在这里查看并可点击切换日志。</div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-5 overflow-y-auto max-h-[calc(86vh-82px)]">
          <div className="grid grid-cols-4 gap-4">
            {layerOrder.map((layer) => {
              const layerItems = groupedItems[layer] || [];
              return (
                <div key={layer} className="rounded-2xl border border-[#153B34] bg-[#081714] overflow-hidden">
                  <button
                    onClick={() => onSelect(`layer:${layer}`)}
                    className={`w-full px-4 py-3 text-left border-b transition-colors ${
                      selectedId === `layer:${layer}` ? 'border-[#00DFA2] bg-[#00DFA2]/10' : 'border-[#153B34] bg-[#051210]/50 hover:bg-[#0C221E]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-white">{layer}</span>
                      <span className="text-[10px] text-slate-500">{layerItems.length}项</span>
                    </div>
                  </button>
                  <div className="p-3 space-y-2">
                    {layerItems.map((item) => (
                      <StrategyTopologyNodeCard
                        key={item.id}
                        item={item}
                        active={selectedId === item.id}
                        onClick={() => onSelect(item.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const StrategyTopologyCluster = ({ className, layer, title, subtitle, items, selectedId, active, maxVisible, onSelect, accent }) => {
  const visibleItems = items.slice(0, maxVisible);
  const hiddenCount = Math.max(items.length - visibleItems.length, 0);
  const accentClasses = accent === 'amber'
    ? 'border-amber-500/35 bg-amber-500/10 text-amber-300'
    : 'border-[#00DFA2]/35 bg-[#00DFA2]/10 text-[#00DFA2]';

  return (
    <div className={`absolute ${className}`}>
      <button
        onClick={() => onSelect(`layer:${layer}`)}
        className={`w-full rounded-2xl border px-4 py-3 text-left mb-3 transition-all ${
          active ? accentClasses : 'border-[#153B34] bg-[#081714]/90 hover:border-[#256052] text-slate-300'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="text-[11px] font-bold">{layer}</div>
          <span className="text-[10px] text-slate-500">{items.length}项</span>
        </div>
        <div className="text-base font-bold text-white mt-1">{title}</div>
        <div className="text-[11px] text-slate-500 mt-1">{subtitle}</div>
      </button>
      <div className="space-y-2">
        {visibleItems.map((item) => (
          <StrategyTopologyNodeCard
            key={item.id}
            item={item}
            active={selectedId === item.id}
            onClick={() => onSelect(item.id)}
          />
        ))}
        {hiddenCount > 0 && (
          <button
            onClick={() => onSelect(`layer:${layer}`)}
            className="w-full rounded-xl border border-dashed border-[#153B34] bg-[#081714]/70 px-3 py-2 text-left text-[11px] text-slate-500 hover:text-slate-300 hover:border-[#256052]"
          >
            还有 {hiddenCount} 项策略折叠在该层，点击查看汇总日志
          </button>
        )}
      </div>
    </div>
  );
};

const StrategyTopologyNodeCard = ({ item, active, onClick }) => (
  <button
    onClick={onClick}
    className={`group w-full rounded-xl border px-3 py-3 text-left transition-all ${
      active ? 'border-[#00DFA2] bg-[#00DFA2]/12 shadow-[0_0_22px_rgba(0,223,162,0.12)]' : 'border-[#153B34] bg-[#061713]/90 hover:border-[#256052]'
    }`}
  >
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <div className="text-sm font-bold text-white truncate">{item.name}</div>
        <div className="text-[10px] text-slate-500 mt-1 truncate">{item.target}</div>
      </div>
      <span className={`px-1.5 py-0.5 rounded border text-[10px] shrink-0 ${item.status.includes('告警') ? 'border-amber-500/30 bg-amber-500/10 text-amber-300' : 'border-[#00DFA2]/30 bg-[#00DFA2]/10 text-[#00DFA2]'}`}>
        {item.status}
      </span>
    </div>
    <div className="text-[11px] text-slate-400 mt-3 h-8 overflow-hidden leading-4">{item.latestAction}</div>
  </button>
);

const StrategyTopologyMicroNode = ({ item, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full rounded-xl border px-3 py-2.5 text-left transition-all ${
      active ? 'border-blue-300 bg-blue-400/15' : 'border-blue-400/20 bg-[#061713]/80 hover:border-blue-300/60'
    }`}
  >
    <div className="flex items-center justify-between gap-2">
      <div className="text-xs font-bold text-white truncate">{item.name}</div>
      <span className="h-2 w-2 rounded-full bg-blue-300 shadow-[0_0_12px_rgba(96,165,250,0.8)]"></span>
    </div>
    <div className="text-[10px] text-slate-500 mt-1 truncate">{item.latestAction}</div>
  </button>
);

const StrategyTopologyFocusNode = ({ item, active, onClick }) => (
  <button
    onClick={onClick}
    className={`relative w-full rounded-2xl border px-4 py-4 text-left overflow-hidden transition-all ${
      active ? 'border-[#00DFA2] bg-[#00DFA2]/15' : 'border-[#00DFA2]/25 bg-[#061713]/85 hover:border-[#00DFA2]'
    }`}
  >
    <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#00DFA2]/10 blur-xl"></div>
    <div className="relative flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="text-lg font-bold text-white truncate">{item.name}</div>
        <div className="text-[11px] text-slate-500 mt-1">{item.priority}</div>
      </div>
      <span className="px-2 py-1 rounded-full border border-[#00DFA2]/30 bg-[#00DFA2]/10 text-[#00DFA2] text-[10px] shrink-0">{item.status}</span>
    </div>
    <div className="relative mt-4 rounded-xl border border-[#153B34] bg-[#081714]/80 px-3 py-2 text-[11px] text-slate-300 leading-relaxed">
      {item.latestAction}
    </div>
  </button>
);

const StrategyExecutionTargetNode = ({ node }) => (
  <div className="relative overflow-hidden rounded-xl border border-blue-400/20 bg-blue-400/10 px-3 py-3">
    <div className="absolute -right-5 -top-5 h-12 w-12 rounded-full blur-xl opacity-40" style={{ background: node.color }}></div>
    <div className="relative flex items-center justify-between gap-2">
      <div>
        <div className="text-sm font-bold text-white">{node.label}</div>
        <div className="text-[10px] text-slate-500 mt-1">{node.detail}</div>
      </div>
      <span className="h-2.5 w-2.5 rounded-full shadow-[0_0_12px_currentColor]" style={{ background: node.color, color: node.color }}></span>
    </div>
  </div>
);

const GridSwitchConfirmModal = ({ open, config, targetMeta, targetMode, onClose, onConfirm }) => {
  if (!open || !targetMeta) return null;
  const steps = getGridSwitchSteps(config.topology, targetMode);
  const currentMeta = getGridSwitchModeMeta(config.mode);
  const checks = [
    { label: '电网状态', value: config.gridStatus, ok: true },
    { label: 'PCS在线', value: config.pcsStatus, ok: true },
    { label: 'SOC安全', value: config.soc, ok: true },
    { label: '关键开关可控', value: config.topology === 'with_sts' ? 'QF/STS 可控' : 'QF1/QF2 可控', ok: true },
    { label: '严重告警', value: '无', ok: true },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-[720px] rounded-2xl border border-[#00DFA2]/30 bg-gradient-to-br from-[#0C221E] to-[#081714] shadow-[0_0_30px_rgba(0,223,162,0.12)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#153B34] bg-[#051210]/50 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <GitBranch size={20} className="text-[#00DFA2]" />
              并离网切换确认
            </h3>
            <p className="text-xs text-slate-400 mt-1">{currentMeta.label} → {targetMeta.label}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-5 gap-2">
            {checks.map((item) => (
              <div key={item.label} className="rounded-lg border border-[#153B34] bg-[#081714] p-3">
                <div className="text-[10px] text-slate-500 mb-1">{item.label}</div>
                <div className="text-xs font-bold text-[#00DFA2]">{item.value}</div>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-[#153B34] bg-[#081714] p-4">
            <div className="text-sm font-bold text-white mb-3">执行步骤</div>
            <div className="grid grid-cols-4 gap-2">
              {steps.map((step, index) => (
                <div key={step} className="rounded-lg border border-[#153B34] bg-[#0C221E] p-3">
                  <div className="text-[10px] text-[#00DFA2] mb-1">STEP {index + 1}</div>
                  <div className="text-xs text-slate-300">{step}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
            当前为前端演示态，确认后只更新页面状态；真实系统需执行权限校验、同期/联锁校验和操作票记录。
          </div>
        </div>
        <div className="px-6 py-4 border-t border-[#153B34] bg-[#051210]/40 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-[#153B34] text-sm text-slate-300 hover:text-white">取消</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-[#00DFA2] text-[#051210] text-sm font-bold">确认切换</button>
        </div>
      </div>
    </div>
  );
};

const PlanCurveStrategyPage = ({ source, onSourceChange, data, resourceConfig, onResourceChange, targetAdjustments, onTargetChange }) => (
  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
    <div className="bg-[#0C221E] border border-[#153B34] rounded-xl overflow-hidden shadow-lg">
      <div className="px-5 py-4 border-b border-[#153B34] bg-[#081714]/60 flex items-center justify-between gap-4">
        <div>
          <h4 className="text-white font-bold text-base flex items-center gap-2">
            <LineChart size={18} className="text-[#00DFA2]" />
            计划曲线策略
          </h4>
          <p className="text-xs text-slate-500 mt-1">接收用户计划或 VPP 调度计划，并分解到站内设备执行曲线。</p>
        </div>
        <div className="flex rounded-lg border border-[#153B34] bg-[#081714] p-1">
          <button onClick={() => onSourceChange('user')} className={`px-3 py-1.5 rounded text-xs font-bold ${source === 'user' ? 'bg-[#00DFA2] text-[#051210]' : 'text-slate-400 hover:text-white'}`}>用户自定义</button>
          <button onClick={() => onSourceChange('vpp')} className={`px-3 py-1.5 rounded text-xs font-bold ${source === 'vpp' ? 'bg-blue-400 text-[#051210]' : 'text-slate-400 hover:text-white'}`}>VPP调度</button>
        </div>
      </div>

      <div className="p-5 grid grid-cols-4 gap-3">
        <MetricLite label="计划编号" value={data.summary.dispatchNo} />
        {source === 'vpp' && <MetricLite label="VPP下发功率" value={`${data.summary.vppTargetPower} kW`} />}
        <MetricLite label="当前计划功率" value={`${data.summary.planPower} kW`} tone="green" />
        <MetricLite label="实时运行功率" value={`${data.summary.actualPower} kW`} />
        <MetricLite label="偏差点数" value={`${data.summary.outOfRangeCount} / 96`} tone={data.summary.outOfRangeCount > 0 ? 'amber' : 'green'} />
      </div>
    </div>

    <div className="bg-[#0C221E] border border-[#153B34] rounded-xl overflow-hidden shadow-lg">
      <div className="px-5 py-4 border-b border-[#153B34] bg-[#081714]/60">
        <div className="text-sm font-bold text-white">目标曲线控制</div>
        <div className="text-[11px] text-slate-500 mt-1">
          {source === 'vpp' ? 'VPP 下发目标作为基准，EMS 根据本地约束生成执行目标曲线。' : '用户目标曲线可通过整体偏移和倍率快速调整。'}
        </div>
      </div>
      <div className="p-5 grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1.5">目标整体偏移(kW)</label>
          <input value={targetAdjustments.offset} onChange={(event) => onTargetChange('offset', event.target.value)} className="w-full bg-[#081714] border border-[#153B34] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00DFA2]" />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1.5">目标倍率</label>
          <input value={targetAdjustments.multiplier} onChange={(event) => onTargetChange('multiplier', event.target.value)} className="w-full bg-[#081714] border border-[#153B34] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00DFA2]" />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1.5">允许偏差阈值(%)</label>
          <input value={targetAdjustments.tolerance} onChange={(event) => onTargetChange('tolerance', event.target.value)} className="w-full bg-[#081714] border border-[#153B34] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00DFA2]" />
        </div>
      </div>
    </div>

    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-8 bg-[#0C221E] border border-[#153B34] rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-bold text-white">{source === 'vpp' ? 'VPP目标 / EMS执行 / 实时跟踪' : '用户目标 / 实时跟踪'}</div>
            <div className="text-[11px] text-slate-500 mt-1">先看站级目标曲线，再向下拆解到资源执行曲线。</div>
          </div>
          <div className="flex gap-3 text-[11px] text-slate-400">
            {source === 'vpp' && <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-300"></span>VPP下发</span>}
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#00DFA2]"></span>EMS执行目标</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-400"></span>实时运行</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-300/40"></span>允许偏差带</span>
          </div>
        </div>
        <PlanCurveChart rows={data.rows} showVppTarget={source === 'vpp'} />
      </div>

      <div className="col-span-4 bg-[#0C221E] border border-[#153B34] rounded-xl overflow-hidden shadow-lg">
        <div className="px-4 py-3 border-b border-[#153B34] bg-[#081714]/60">
          <div className="text-sm font-bold text-white">偏差告警</div>
          <div className="text-[11px] text-slate-500 mt-1">超过阈值或 20kW 计入偏差。</div>
        </div>
        <div className="p-4 space-y-3">
          {data.devices.map((device) => (
            <div key={device.id} className={`rounded-lg border p-3 ${device.status === '偏差告警' ? 'border-amber-500/30 bg-amber-500/10' : 'border-[#153B34] bg-[#081714]'}`}>
              <div className="flex items-center justify-between gap-3 mb-2">
                <div>
                  <div className="text-sm font-bold text-white">{device.name}</div>
                  <div className="text-[10px] text-slate-500">{device.type}</div>
                </div>
                <span className={`text-[10px] ${device.status === '偏差告警' ? 'text-amber-300' : 'text-[#00DFA2]'}`}>{device.status}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400">
                <span>计划 {device.planPower}kW</span>
                <span>实时 {device.actualPower}kW</span>
                <span>执行 {device.executionRate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <PlanDecompositionTopology data={data} resourceConfig={resourceConfig} />

    <div className="bg-[#0C221E] border border-[#153B34] rounded-xl overflow-hidden shadow-lg">
      <div className="px-5 py-4 border-b border-[#153B34] bg-[#081714]/60">
        <div className="text-sm font-bold text-white">分解配置</div>
        <div className="text-[11px] text-slate-500 mt-1">按设备或资源设置参与状态、分解比例、优先级和跟踪模式，配置即时影响下方设备曲线。</div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-xs text-left">
          <thead className="bg-[#081714] text-slate-500">
            <tr>
              <th className="px-4 py-3 border-b border-[#153B34]">参与</th>
              <th className="px-4 py-3 border-b border-[#153B34]">资源</th>
              <th className="px-4 py-3 border-b border-[#153B34]">分解比例(%)</th>
              <th className="px-4 py-3 border-b border-[#153B34]">优先级</th>
              <th className="px-4 py-3 border-b border-[#153B34]">功率上限(kW)</th>
              <th className="px-4 py-3 border-b border-[#153B34]">跟踪模式</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#153B34] bg-[#0B1E1A]">
            {resourceConfig.map((resource) => (
              <tr key={resource.id}>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={resource.enabled}
                    onChange={(event) => onResourceChange(resource.id, 'enabled', event.target.checked)}
                    className="accent-[#00DFA2]"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: resource.color }}></span>
                    <div>
                      <div className="text-white font-bold">{resource.name}</div>
                      <div className="text-[10px] text-slate-500">{resource.type}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <input value={resource.ratio} onChange={(event) => onResourceChange(resource.id, 'ratio', event.target.value)} className="w-24 bg-[#081714] border border-[#153B34] rounded px-2 py-1.5 text-white focus:outline-none focus:border-[#00DFA2]" />
                </td>
                <td className="px-4 py-3">
                  <select value={resource.priority} onChange={(event) => onResourceChange(resource.id, 'priority', event.target.value)} className="bg-[#081714] border border-[#153B34] rounded px-2 py-1.5 text-white focus:outline-none focus:border-[#00DFA2]">
                    {['P1', 'P2', 'P3', 'P4'].map((priority) => <option key={priority} value={priority}>{priority}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <input value={resource.maxPower} onChange={(event) => onResourceChange(resource.id, 'maxPower', event.target.value)} className="w-24 bg-[#081714] border border-[#153B34] rounded px-2 py-1.5 text-white focus:outline-none focus:border-[#00DFA2]" />
                </td>
                <td className="px-4 py-3">
                  <select value={resource.trackingMode} onChange={(event) => onResourceChange(resource.id, 'trackingMode', event.target.value)} className="w-40 bg-[#081714] border border-[#153B34] rounded px-2 py-1.5 text-white focus:outline-none focus:border-[#00DFA2]">
                    {['优先跟踪计划', '经济性优先', '保留备用容量', '舒适/服务优先'].map((mode) => <option key={mode} value={mode}>{mode}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    <div className="bg-[#0C221E] border border-[#153B34] rounded-xl overflow-hidden shadow-lg">
      <div className="px-5 py-4 border-b border-[#153B34] bg-[#081714]/60">
        <div className="text-sm font-bold text-white">设备分解曲线</div>
        <div className="text-[11px] text-slate-500 mt-1">将总计划按资源能力拆解为 PCS、光伏、充电桩和可控负荷执行曲线。</div>
      </div>
      <div className="p-5 grid grid-cols-4 gap-4">
        {data.devices.map((device) => (
          <div key={device.id} className="rounded-xl border border-[#153B34] bg-[#081714] p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="text-sm font-bold text-white">{device.name}</div>
                <div className="text-[10px] text-slate-500 mt-1">偏差 {device.deviation} kW</div>
              </div>
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: device.color }}></span>
            </div>
            <DevicePlanMiniChart rows={device.rows} color={device.color} />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const PlanDecompositionTopology = ({ data, resourceConfig }) => {
  const isVpp = data.source === 'vpp';
  const getResourceConfig = (deviceId) => resourceConfig.find((item) => item.id === deviceId);

  return (
    <div className="bg-[#0C221E] border border-[#153B34] rounded-xl overflow-hidden shadow-lg">
      <div className="px-5 py-4 border-b border-[#153B34] bg-[#081714]/60 flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-bold text-white">目标分解拓扑</div>
          <div className="text-[11px] text-slate-500 mt-1">站级目标曲线向下分解到储能、光伏、有序充电和可控负荷。</div>
        </div>
        <div className="text-[11px] text-slate-500">当前采样点：14:30</div>
      </div>

      <div className="p-5 grid grid-cols-12 gap-4 items-stretch">
        <div className="col-span-3 rounded-2xl border border-[#00DFA2]/35 bg-gradient-to-br from-[#00DFA2]/15 to-[#081714] p-4 flex flex-col justify-between">
          <div>
            <div className="text-[11px] text-[#00DFA2] font-bold mb-2">站级目标曲线</div>
            <div className="text-2xl font-bold text-white">{data.summary.planPower} kW</div>
            <div className="text-[11px] text-slate-400 mt-2">{isVpp ? 'EMS执行目标曲线' : '用户目标曲线'}</div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {isVpp && (
              <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2">
                <div className="text-[10px] text-amber-200">VPP下发</div>
                <div className="text-xs font-bold text-white mt-1">{data.summary.vppTargetPower} kW</div>
              </div>
            )}
            <div className="rounded-lg border border-blue-500/25 bg-blue-500/10 px-3 py-2">
              <div className="text-[10px] text-blue-200">实时运行</div>
              <div className="text-xs font-bold text-white mt-1">{data.summary.actualPower} kW</div>
            </div>
            <div className="rounded-lg border border-[#153B34] bg-[#081714] px-3 py-2">
              <div className="text-[10px] text-slate-500">站级偏差</div>
              <div className="text-xs font-bold text-white mt-1">{data.summary.deviation} kW</div>
            </div>
          </div>
        </div>

        <div className="col-span-1 flex items-center justify-center">
          <div className="w-full h-px bg-gradient-to-r from-[#00DFA2] to-blue-400 relative">
            <span className="absolute -right-1 -top-1.5 h-3 w-3 rotate-45 border-r border-t border-blue-400"></span>
          </div>
        </div>

        <div className="col-span-8 grid grid-cols-4 gap-3">
          {data.devices.map((device) => {
            const resource = getResourceConfig(device.id);
            const enabled = resource?.enabled;
            const ratio = Number(resource?.ratio) || 0;
            const alert = device.status === '偏差告警';
            return (
              <div
                key={device.id}
                className={`rounded-xl border p-4 min-h-[176px] ${
                  enabled ? (alert ? 'border-amber-500/35 bg-amber-500/10' : 'border-[#153B34] bg-[#081714]') : 'border-[#153B34] bg-[#081714]/50 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="text-sm font-bold text-white">{device.name}</div>
                    <div className="text-[10px] text-slate-500 mt-1">{device.trackingMode}</div>
                  </div>
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: device.color }}></span>
                </div>
                <div className="space-y-2 text-[11px]">
                  <div className="flex justify-between gap-2 text-slate-400"><span>分解比例</span><span className="text-white font-bold">{enabled ? `${ratio}%` : '未参与'}</span></div>
                  <div className="flex justify-between gap-2 text-slate-400"><span>计划功率</span><span className="text-white">{device.planPower} kW</span></div>
                  <div className="flex justify-between gap-2 text-slate-400"><span>实时功率</span><span className="text-white">{device.actualPower} kW</span></div>
                  <div className="flex justify-between gap-2 text-slate-400"><span>偏差</span><span className={alert ? 'text-amber-300' : 'text-[#00DFA2]'}>{device.deviation} kW</span></div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="px-2 py-1 rounded border border-[#153B34] bg-[#0C221E] text-[10px] text-slate-400">{device.priority}</span>
                  <span className={`text-[10px] ${alert ? 'text-amber-300' : 'text-[#00DFA2]'}`}>{enabled ? device.status : '未参与'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const PlanCurveChart = ({ rows, showVppTarget = false }) => {
  const values = rows.flatMap((row) => [row.plan, row.actual, row.upper, row.lower, ...(showVppTarget ? [row.vppTarget] : [])]);
  const min = Math.min(...values, -120);
  const max = Math.max(...values, 120);
  const range = Math.max(max - min, 1);
  const getX = (time) => (time / 1440) * 100;
  const getY = (value) => 82 - ((value - min) / range) * 64;
  const toPoints = (field) => rows.map((row) => `${getX(row.time)},${getY(row[field])}`).join(' ');
  const bandPoints = `${rows.map((row) => `${getX(row.time)},${getY(row.upper)}`).join(' ')} ${[...rows].reverse().map((row) => `${getX(row.time)},${getY(row.lower)}`).join(' ')}`;

  return (
    <div className="relative h-72 rounded-lg border border-[#153B34] bg-[#081714] p-2">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        <line x1="0" y1="50" x2="100" y2="50" stroke="#244237" strokeWidth="0.35" />
        <line x1="0" y1="22" x2="100" y2="22" stroke="#1c312a" strokeWidth="0.25" strokeDasharray="1.5 1.5" />
        <line x1="0" y1="78" x2="100" y2="78" stroke="#1c312a" strokeWidth="0.25" strokeDasharray="1.5 1.5" />
        {Array.from({ length: 5 }, (_, index) => <line key={index} x1={index * 25} y1="0" x2={index * 25} y2="100" stroke="#173129" strokeWidth="0.25" />)}
        <polygon points={bandPoints} fill="rgba(251,191,36,0.12)" stroke="none" />
        {showVppTarget && <polyline points={toPoints('vppTarget')} fill="none" stroke="#FBBF24" strokeWidth="0.75" strokeDasharray="1.4 1.2" strokeLinejoin="round" />}
        <polyline points={toPoints('plan')} fill="none" stroke="#00DFA2" strokeWidth="0.9" strokeLinejoin="round" />
        <polyline points={toPoints('actual')} fill="none" stroke="#60A5FA" strokeWidth="0.9" strokeLinejoin="round" />
      </svg>
      <div className="absolute inset-x-3 bottom-2 flex justify-between text-[10px] text-slate-500">
        <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span>
      </div>
    </div>
  );
};

const DevicePlanMiniChart = ({ rows, color }) => {
  const values = rows.flatMap((row) => [row.plan, row.actual]);
  const min = Math.min(...values, -80);
  const max = Math.max(...values, 80);
  const range = Math.max(max - min, 1);
  const getX = (time) => (time / 1440) * 100;
  const getY = (value) => 82 - ((value - min) / range) * 64;
  const planPoints = rows.map((row) => `${getX(row.time)},${getY(row.plan)}`).join(' ');
  const actualPoints = rows.map((row) => `${getX(row.time)},${getY(row.actual)}`).join(' ');

  return (
    <div className="h-28 rounded-lg border border-[#153B34] bg-[#051210] p-1">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        <line x1="0" y1="50" x2="100" y2="50" stroke="#244237" strokeWidth="0.4" />
        <polyline points={planPoints} fill="none" stroke={color} strokeWidth="1" strokeLinejoin="round" />
        <polyline points={actualPoints} fill="none" stroke="#94A3B8" strokeWidth="0.7" strokeOpacity="0.85" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

const GenericFeaturePage = ({ title, description, cards = [] }) => (
  <div className="relative z-10 animate-in fade-in slide-in-from-bottom-4">
    <div className="bg-[#0C221E] border border-[#153B34] rounded-xl overflow-hidden shadow-lg">
      <div className="px-5 py-4 border-b border-[#153B34] bg-[#081714]/60">
        <h3 className="text-white font-bold text-lg">{title}</h3>
        <p className="text-sm text-slate-400 mt-1">{description}</p>
      </div>
      <div className="p-5 grid grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card} className="rounded-xl border border-[#153B34] bg-[#081714] p-4">
            <div className="text-sm font-bold text-white">{card}</div>
            <div className="text-[11px] text-slate-500 mt-2">当前为信息架构占位页，后续将在该位置接入真实业务视图、接口数据与操作权限。</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const StationArchivePage = ({ storageBoundaryConfig, onOpenStorageBoundaryModal }) => (
  <div className="relative z-10 animate-in fade-in slide-in-from-bottom-4 space-y-6">
    <div className="bg-[#0C221E] border border-[#153B34] rounded-xl overflow-hidden shadow-lg">
      <div className="px-5 py-4 border-b border-[#153B34] bg-[#081714]/60 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-white font-bold text-lg">电站档案</h3>
          <p className="text-sm text-slate-400 mt-1">维护电站基础信息、容量边界和并网运行参数。储能运行边界在这里作为全局策略配置源管理。</p>
        </div>
        <button
          onClick={onOpenStorageBoundaryModal}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#00DFA2] to-[#10B981] text-[#051210] text-xs font-bold hover:brightness-110"
        >
          编辑储能运行边界
        </button>
      </div>
      <div className="p-5 space-y-5">
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-[#153B34] bg-[#081714] p-4">
            <div className="text-sm font-bold text-white">电站基础信息</div>
            <div className="text-[11px] text-slate-500 mt-2 leading-relaxed">站名：园区微网 A1<br />并网方式：并网运行 / 可离网<br />额定电压等级：10kV</div>
          </div>
          <div className="rounded-xl border border-[#153B34] bg-[#081714] p-4">
            <div className="text-sm font-bold text-white">容量与设备规模</div>
            <div className="text-[11px] text-slate-500 mt-2 leading-relaxed">储能容量：500 kWh<br />PCS规模：250 kW<br />储能柜数量：2 台</div>
          </div>
          <div className="rounded-xl border border-[#153B34] bg-[#081714] p-4">
            <div className="text-sm font-bold text-white">并网与运行参数</div>
            <div className="text-[11px] text-slate-500 mt-2 leading-relaxed">并网点：10kV 母线<br />变压器容量：1000 kVA<br />主运行模式：边缘自治</div>
          </div>
        </div>
        <div className="bg-[#081714] border border-[#153B34] rounded-xl p-5">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <div className="text-base font-bold text-white">储能运行边界</div>
              <div className="text-[11px] text-slate-500 mt-1">作为全局约束，统一作用于削峰填谷模板智能规划、模板保存校验和智能经济调度生成。</div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <MetricLite label="SOC运行区间" value={`${storageBoundaryConfig.socMin}-${storageBoundaryConfig.socMax}%`} />
            <MetricLite label="备用SOC" value={`${storageBoundaryConfig.reserveSoc}%`} />
            <MetricLite label="充电功率边界" value={`${storageBoundaryConfig.chargePowerMin}-${storageBoundaryConfig.chargePowerMax} kW`} tone="green" />
            <MetricLite label="放电功率边界" value={`${storageBoundaryConfig.dischargePowerMin}-${storageBoundaryConfig.dischargePowerMax} kW`} tone="amber" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SignalPreviewTable = ({ title, items }) => (
  <div className="bg-[#081714] border border-[#153B34] rounded-xl overflow-hidden">
    <div className="px-4 py-3 border-b border-[#153B34] text-sm font-bold text-white">{title}</div>
    <table className="w-full text-xs text-left">
      <thead className="bg-[#0C221E] text-slate-500 uppercase">
        <tr>
          <th className="px-4 py-2 border-b border-[#153B34]">点位编码</th>
          <th className="px-4 py-2 border-b border-[#153B34]">物模型名称</th>
          <th className="px-4 py-2 border-b border-[#153B34]">默认业务名称</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[#153B34]">
        {items.length > 0 ? (
          items.map((item) => (
            <tr key={item.id}>
              <td className="px-4 py-2 font-mono text-[#00DFA2]">{item.pointCode}</td>
              <td className="px-4 py-2 text-slate-400">{item.originModelName}</td>
              <td className="px-4 py-2 text-slate-200">{item.displayName}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td className="px-4 py-3 text-slate-500" colSpan={3}>该设备暂无可预览点位</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

const SyncStatusItem = ({ label, status, time }) => (
  <div className="flex items-center justify-between bg-[#051210] p-3 rounded border border-[#153B34]">
    <span className="text-xs text-slate-300">{label}</span>
    <div className="flex items-center gap-3">
      <span className="text-[10px] text-slate-500">{time}</span>
      <span className="text-xs text-[#00DFA2] flex items-center gap-1"><CheckCircle2 size={12}/> {status}</span>
    </div>
  </div>
);

const TableRow = ({ start, end, power, status, type }) => {
  const getStatusColor = (t) => {
    switch(t) {
      case 'charge': return 'text-[#00DFA2] bg-[#00DFA2]/10 border-[#00DFA2]/30';
      case 'discharge': return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
      default: return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  return (
    <tr className="hover:bg-[#081714]/80 transition-colors">
      <td className="px-4 py-2 border-b border-[#153B34]/50">{start}</td>
      <td className="px-4 py-2 border-b border-[#153B34]/50">{end}</td>
      <td className={`px-4 py-2 border-b border-[#153B34]/50 font-mono ${parseFloat(power) > 0 ? 'text-[#00DFA2]' : parseFloat(power) < 0 ? 'text-amber-400' : 'text-slate-500'}`}>{power}</td>
      <td className="px-4 py-2 border-b border-[#153B34]/50"><span className={`px-2 py-0.5 rounded text-[10px] border ${getStatusColor(type)}`}>{status}</span></td>
      <td className="px-4 py-2 border-b border-[#153B34]/50 text-right">
        <button className="text-slate-500 hover:text-white p-1"><Edit3 size={14}/></button>
        <button className="text-slate-500 hover:text-red-400 p-1 ml-1"><Trash2 size={14}/></button>
      </td>
    </tr>
  );
};

const StatusCell = ({ label, value, tone = 'default' }) => {
  const toneClass = tone === 'green' ? 'text-[#00DFA2]' : tone === 'amber' ? 'text-amber-300' : 'text-white';
  return (
    <div className="rounded-lg border border-[#153B34] bg-[#0C221E] px-3 py-2">
      <div className="text-[10px] text-slate-500">{label}</div>
      <div className={`text-sm font-medium mt-1 ${toneClass}`}>{value}</div>
    </div>
  );
};

const StorageBoundaryInput = ({ label, value, onChange }) => (
  <label className="block">
    <span className="block text-xs text-slate-400 mb-1.5">{label}</span>
    <input
      type="number"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full bg-[#081714] border border-[#153B34] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00DFA2]"
    />
  </label>
);

const FixedTariffBandChart = ({ periods }) => {
  const sortedPeriods = [...periods].sort((a, b) => parseTimeToMinutes(a.start) - parseTimeToMinutes(b.start));
  const maxPrice = Math.max(...sortedPeriods.map((period) => Number(period.price) || 0), 1);

  return (
    <div className="rounded-xl border border-[#153B34] bg-gradient-to-br from-[#081714] to-[#061613] p-4 shadow-inner">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm font-bold text-white">固定电价色带预览</div>
          <div className="text-[11px] text-slate-500 mt-1">尖峰平谷深谷按 24 小时横轴展示，柱高表示价格相对水平。</div>
        </div>
        <div className="flex flex-wrap gap-2">
          {tariffLevelOptions.map((level) => (
            <span key={level.value} className={`px-2 py-1 rounded-full border text-[10px] ${level.badge}`}>{level.value}</span>
          ))}
        </div>
      </div>
      <div className="relative h-36 rounded-xl border border-[#153B34] bg-[#0C221E] overflow-hidden">
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'linear-gradient(rgba(21,59,52,0.55) 1px, transparent 1px), linear-gradient(90deg, rgba(21,59,52,0.35) 1px, transparent 1px)', backgroundSize: '100% 34px, 8.33% 100%' }}></div>
        {sortedPeriods.map((period) => {
          const start = parseTimeToMinutes(period.start);
          const end = parseTimeToMinutes(period.end);
          const meta = getTariffLevelMeta(period.level);
          const price = Number(period.price) || 0;
          const barHeight = 22 + (price / maxPrice) * 62;
          return (
            <div
              key={period.id}
              className="absolute bottom-5 border-r border-[#051210]/70 rounded-t-lg overflow-hidden"
              style={{
                left: `${(start / 1440) * 100}%`,
                width: `${Math.max(0, ((end - start) / 1440) * 100)}%`,
                height: `${barHeight}px`,
                background: meta.color,
              }}
            >
              <div className="p-2 text-[10px] text-white font-bold leading-tight">
                <div>{period.level}</div>
                <div className="text-slate-200/80 mt-1">{period.price}</div>
              </div>
            </div>
          );
        })}
        <div className="absolute inset-x-2 bottom-1 flex justify-between text-[10px] text-slate-500">
          <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span>
        </div>
      </div>
    </div>
  );
};

const FixedTariffPeriodRow = ({ period, onChange, onRemove }) => {
  const meta = getTariffLevelMeta(period.level);
  return (
    <tr className="hover:bg-[#081714]/70 transition-colors">
      <td className="px-4 py-3">
        <input type="time" value={period.start} onChange={(event) => onChange(period.id, 'start', event.target.value)} className="bg-[#081714] border border-[#153B34] rounded px-2 py-1.5 text-white focus:outline-none focus:border-[#00DFA2]" />
      </td>
      <td className="px-4 py-3">
        <input type="time" value={period.end} onChange={(event) => onChange(period.id, 'end', event.target.value)} className="bg-[#081714] border border-[#153B34] rounded px-2 py-1.5 text-white focus:outline-none focus:border-[#00DFA2]" />
      </td>
      <td className="px-4 py-3">
        <select value={period.level} onChange={(event) => onChange(period.id, 'level', event.target.value)} className={`bg-[#081714] border rounded px-2 py-1.5 focus:outline-none ${meta.badge}`}>
          {tariffLevelOptions.map((level) => <option key={level.value} value={level.value}>{level.value}</option>)}
        </select>
      </td>
      <td className="px-4 py-3">
        <input type="number" min="0" step="0.0001" value={period.price} onChange={(event) => onChange(period.id, 'price', event.target.value)} className="w-28 bg-[#081714] border border-[#153B34] rounded px-2 py-1.5 text-white focus:outline-none focus:border-[#00DFA2]" />
      </td>
      <td className="px-4 py-3 text-right">
        <button onClick={() => onRemove(period.id)} className="p-1.5 rounded border border-[#153B34] text-slate-500 hover:text-red-400">
          <Trash2 size={14} />
        </button>
      </td>
    </tr>
  );
};

const DynamicTariffRow = ({ row, index, onChangePrice }) => {
  return (
    <tr className="hover:bg-[#0C221E]/70">
      <td className="px-3 py-2 text-slate-500">{String(index + 1).padStart(2, '0')}</td>
      <td className="px-3 py-2 text-slate-300 font-mono">{row.start}</td>
      <td className="px-3 py-2 text-slate-300 font-mono">{row.end}</td>
      <td className="px-3 py-2">
        <input type="number" step="0.0001" value={row.price} onChange={(event) => onChangePrice(row.id, event.target.value)} className="w-24 bg-[#081714] border border-[#153B34] rounded px-2 py-1.5 text-white focus:outline-none focus:border-blue-400" />
      </td>
    </tr>
  );
};

const DynamicTariffChart = ({ rows }) => {
  const prices = rows.map((row) => Number(row.price)).filter((price) => !Number.isNaN(price));
  const minPrice = Math.min(...prices, 0);
  const maxPrice = Math.max(...prices, 1);
  const range = Math.max(maxPrice - minPrice, 0.1);
  const avgPrice = prices.reduce((sum, price) => sum + price, 0) / Math.max(prices.length, 1);
  const getPriceY = (price) => 82 - ((price - minPrice) / range) * 64;
  const points = buildIntervalStepPolyline(rows, getPriceY);
  const areaPoints = points ? `0,92 ${points} 100,92` : '';
  const maxIndex = rows.findIndex((row) => Number(row.price) === maxPrice);
  const minIndex = rows.findIndex((row) => Number(row.price) === minPrice);
  const getPoint = (index, price) => {
    const targetRow = rows[Math.max(0, index)] || rows[0];
    const start = targetRow ? parseTimeToMinutes(targetRow.start) : 0;
    return {
      x: (start / 1440) * 100,
      y: getPriceY(price),
    };
  };
  const maxPoint = getPoint(Math.max(0, maxIndex), maxPrice);
  const minPoint = getPoint(Math.max(0, minIndex), minPrice);

  return (
    <div className="rounded-xl border border-[#153B34] bg-gradient-to-br from-[#081714] to-[#061613] p-4 shadow-inner">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-bold text-white">动态电价折线预览</div>
          <div className="text-[11px] text-slate-500 mt-1">按离散时段展示市场电价折线，下方色带仅用于辅助识别价格区间。</div>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="px-2 py-1 rounded border border-red-500/30 bg-red-500/10 text-red-300">最高 {maxPrice.toFixed(4)}</span>
          <span className="px-2 py-1 rounded border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">最低 {minPrice.toFixed(4)}</span>
          <span className="px-2 py-1 rounded border border-blue-500/30 bg-blue-500/10 text-blue-300">均价 {avgPrice.toFixed(4)}</span>
        </div>
      </div>
      <div className="relative h-64">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
          <defs>
            <linearGradient id="dynamic-price-area" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.24" />
              <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.02" />
            </linearGradient>
            <filter id="dynamic-price-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="0.7" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {rows.map((row, index) => {
            const width = 100 / Math.max(rows.length, 1);
            return (
              <rect
                key={row.id}
                x={index * width}
                y={72}
                width={width}
                height={18}
                fill={index % 2 === 0 ? 'rgba(59,130,246,0.12)' : 'rgba(34,211,238,0.08)'}
              />
            );
          })}
          <line x1="0" y1="92" x2="100" y2="92" stroke="#244237" strokeWidth="0.4" />
          <line x1="0" y1="18" x2="100" y2="18" stroke="#1c312a" strokeWidth="0.3" strokeDasharray="1.5 1.5" />
          <line x1="0" y1="52" x2="100" y2="52" stroke="#1c312a" strokeWidth="0.3" strokeDasharray="1.5 1.5" />
          {Array.from({ length: 5 }, (_, index) => {
            const x = index * 25;
            return <line key={`dynamic-grid-${x}`} x1={x} y1="0" x2={x} y2="100" stroke="#173129" strokeWidth="0.25" />;
          })}
          <polyline fill="url(#dynamic-price-area)" stroke="none" points={areaPoints} />
          <polyline fill="none" stroke="#60A5FA" strokeWidth="0.95" strokeLinejoin="miter" strokeLinecap="square" filter="url(#dynamic-price-glow)" points={points} />
          {maxIndex >= 0 && <circle cx={maxPoint.x} cy={maxPoint.y} r="0.9" fill="#F87171" />}
          {minIndex >= 0 && <circle cx={minPoint.x} cy={minPoint.y} r="0.9" fill="#22D3EE" />}
        </svg>
        <div className="absolute inset-x-0 bottom-0 flex justify-between text-[10px] text-slate-500">
          <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span>
        </div>
        <div className="absolute left-0 top-2 bottom-7 flex flex-col justify-between text-[10px] text-slate-500">
          <span>{maxPrice.toFixed(2)}</span>
          <span>{avgPrice.toFixed(2)}</span>
          <span>{minPrice.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

const PriceRow = ({ start, end, type, price, colorClass }) => {
  return (
    <tr className="hover:bg-[#081714]/80 transition-colors">
      <td className="px-4 py-2">{start}</td>
      <td className="px-4 py-2">{end}</td>
      <td className="px-4 py-2">
        <span className={`px-2 py-0.5 rounded text-[10px] border ${colorClass} border-current/20 font-bold`}>{type}</span>
      </td>
      <td className="px-4 py-2 font-mono text-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-slate-500">￥</span>
          <input type="text" defaultValue={price} className="bg-transparent border-b border-[#153B34] w-16 focus:outline-none focus:border-blue-400" />
        </div>
      </td>
      <td className="px-4 py-2 text-right">
        <button className="text-slate-500 hover:text-blue-400 p-1 transition-colors"><Trash2 size={14}/></button>
      </td>
    </tr>
  );
}

export default App;
