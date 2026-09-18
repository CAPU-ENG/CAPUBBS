export type GallerySpec = {
    title: string;
    height?: number;
    images: Array<{ url: string; alt: string; caption: string }>;
};
export function galleryHeight(value: unknown): number | undefined;
export function readGalleryTag(tag: Element): GallerySpec | null;
export function buildGalleryHtml(spec: GallerySpec): string;
export function createGalleryElement(spec: GallerySpec, doc?: Document): HTMLElement;
export function createGalleryTag(spec: GallerySpec, doc?: Document): HTMLElement;
export function expandGalleryTags(html: string): string;
export function serializeGalleryTags(html: string): string;
