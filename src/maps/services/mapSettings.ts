export type MapControlsPosition = 'right' | 'left';
export type MapControlsDirection = 'vertical' | 'horizontal';

export interface MapControlsConfig {
  position: MapControlsPosition;
  direction: MapControlsDirection;
}

export function getMapControlsConfig(): MapControlsConfig {
  if (typeof window === 'undefined') {
    return { position: 'right', direction: 'vertical' };
  }
  const pos = (localStorage.getItem('cf_map_controls_position') as MapControlsPosition) || 'right';
  const dir = (localStorage.getItem('cf_map_controls_direction') as MapControlsDirection) || 'vertical';
  return {
    position: pos === 'left' ? 'left' : 'right',
    direction: dir === 'horizontal' ? 'horizontal' : 'vertical',
  };
}

export function setMapControlsConfig(config: Partial<MapControlsConfig>): void {
  if (typeof window === 'undefined') return;
  if (config.position) {
    localStorage.setItem('cf_map_controls_position', config.position);
  }
  if (config.direction) {
    localStorage.setItem('cf_map_controls_direction', config.direction);
  }
  window.dispatchEvent(new CustomEvent('cargoflow:map-controls-config-changed'));
}
