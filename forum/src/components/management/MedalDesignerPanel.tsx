import { Crop, Save, X } from 'lucide-react';
import { useRef, useState, type CSSProperties } from 'react';
import { AvatarDialog } from '../profile/AvatarEditorDialog';
import { useMedalTilt } from '../medals/useMedalTilt';
import {
  MEDAL_OCTAGON_PATH,
  MEDAL_TEXTURES,
  type MedalDraft,
  type MedalTextureId,
} from './medalDesign';

export function MedalDesignerPanel({ initialDraft, mode, onCancel, onSave, saving = false }: {
  initialDraft: MedalDraft;
  mode: 'create' | 'edit';
  onCancel: () => void;
  onSave: (draft: MedalDraft) => void;
  saving?: boolean;
}) {
  const [name, setName] = useState(initialDraft.name);
  const [imageSource, setImageSource] = useState(initialDraft.imageSource);
  const [textureId, setTextureId] = useState<MedalTextureId>(initialDraft.textureId);
  const [cropOpen, setCropOpen] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const rotatorRef = useRef<HTMLDivElement>(null);
  const selectedTexture = MEDAL_TEXTURES.find((texture) => texture.id === textureId) ?? MEDAL_TEXTURES[0];

  useMedalTilt(previewRef, rotatorRef);

  return (
    <>
      <section aria-label={mode === 'create' ? '新建勋章' : '编辑勋章'} className="management-medal-designer">
        <header className="management-medal-section-heading">
          <h3>{mode === 'create' ? '新建勋章' : '编辑勋章'}</h3>
          <div>
            <button className="management-secondary-button" disabled={saving} onClick={onCancel} type="button">
              <X size={15} />取消
            </button>
            <button
              className="management-primary-button"
              disabled={saving || !name.trim() || !imageSource}
              onClick={() => onSave({ imageSource, name: name.trim(), textureId })}
              type="button"
            >
              <Save size={15} />{saving ? '保存中' : '保存勋章'}
            </button>
          </div>
        </header>

        <div className="management-medal-body">
          <div className="management-medal-controls">
            <label className="management-medal-field">
              <span>勋章名称</span>
              <input
                maxLength={24}
                onChange={(event) => setName(event.target.value)}
                type="text"
                value={name}
              />
            </label>

            <div className="management-medal-field">
              <span>图片</span>
              <button className="management-medal-image-button" disabled={saving} onClick={() => setCropOpen(true)} type="button">
                <Crop size={15} />裁剪图片
              </button>
            </div>

            <fieldset className="management-medal-textures">
              <legend>纹理</legend>
              <div className="management-medal-texture-grid">
                {MEDAL_TEXTURES.map((texture) => (
                  <label className="management-medal-texture" key={texture.id} title={texture.label}>
                    <input
                      checked={texture.id === textureId}
                      name="medal-texture"
                      onChange={() => setTextureId(texture.id)}
                      type="radio"
                      value={texture.id}
                    />
                    <span style={{ backgroundImage: `url(${texture.src})` }} />
                    <small>{texture.label}</small>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <section aria-label="勋章预览" className="management-medal-preview-column">
            <h3>预览</h3>
            <div className="management-medal-preview-stage">
              <svg aria-hidden="true" height="0" width="0">
                <defs>
                  <clipPath clipPathUnits="objectBoundingBox" id="management-medal-rounded-octagon">
                    <path d={MEDAL_OCTAGON_PATH} />
                  </clipPath>
                </defs>
              </svg>
              <div aria-label="勋章图案预览" className="management-medal-preview" ref={previewRef} role="img">
                <div
                  className="management-medal-rotator"
                  ref={rotatorRef}
                  style={{ '--medal-foil': `url(${selectedTexture.src})` } as CSSProperties}
                >
                  <div
                    className="management-medal-front"
                    style={{ clipPath: 'url(#management-medal-rounded-octagon)' }}
                  >
                    <img alt="" draggable={false} src={imageSource} />
                    <div aria-hidden="true" className="management-medal-shine" />
                    <div aria-hidden="true" className="management-medal-glare" />
                  </div>
                  <svg
                    aria-hidden="true"
                    className="management-medal-outline"
                    preserveAspectRatio="none"
                    viewBox="0 0 1 1"
                  >
                    <path className="management-medal-outline-shadow" d={MEDAL_OCTAGON_PATH} vectorEffect="non-scaling-stroke" />
                    <path className="management-medal-outline-highlight" d={MEDAL_OCTAGON_PATH} vectorEffect="non-scaling-stroke" />
                  </svg>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
      <AvatarDialog
        avatarSrc={imageSource}
        mode="medal"
        onClose={() => setCropOpen(false)}
        onSave={(src) => setImageSource(src)}
        open={cropOpen}
        showDefaultOption={false}
      />
    </>
  );
}
