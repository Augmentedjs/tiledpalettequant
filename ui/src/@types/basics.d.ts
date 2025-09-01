// Basic app types for React and front-end builds

declare module "*.svg";

// declare module '*.svg?svgr' {
//   type SvgComponent = ComponentType<SVGProps>;
//   const Svg: SvgComponent;
//   export = Svg;
// }

declare module "*.jpg" {
  const content: string;
  export default content;
}

declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.json" {
  const content: string;
  export default content;
}

declare module "*.gif" {
  const content: string;
  export default content;
}