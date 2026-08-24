import { Check, ImagePlus, Moon, Palette, Sun, Trash2, Upload, X } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  deleteProfileFloorDecoration,
  updateProfileDisplayTags,
  uploadProfileFloorDecoration,
} from '../../api/profile';
import type { ProfileViewData } from '../../data/profileDemo';
import type { FloorDecorationVariant } from '../../data/floorDecoration';
import { getDisplayedTags } from '../../data/tags';
import { createFloorDecorationFile } from '../../utils/floorDecorationImage';
import { TagList } from '../tags/TagBadge';
import { AvatarDialog } from './AvatarEditorDialog';

type PendingImage = { file: File; previewSrc: string };

export function ProfilePersonalizationDialog({
  onClose,
  onSave,
  open,
  profile,
}: {
  onClose: () => void;
  onSave: (profile: ProfileViewData) => void;
  open: boolean;
  profile: ProfileViewData;
}) {
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [pendingImages, setPendingImages] = useState<Partial<Record<FloorDecorationVariant, PendingImage>>>({});
  const [deletedVariants, setDeletedVariants] = useState<FloorDecorationVariant[]>([]);
  const [cropVariant, setCropVariant] = useState<FloorDecorationVariant | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const tags = profile.tags ?? [];

  useEffect(() => {
    if (!open) return;
    setSelectedTagIds(getDisplayedTags(tags).map((tag) => tag.id));
    setPendingImages({});
    setDeletedVariants([]);
    setCropVariant(null);
    setSaving(false);
    setError('');
  }, [open, profile.id]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !cropVariant && !saving) onClose();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [cropVariant, onClose, open, saving]);

  if (!open) return null;

  function imagePath(variant: FloorDecorationVariant) {
    const pending = pendingImages[variant];
    if (pending) return pending.previewSrc;
    if (deletedVariants.includes(variant)) return '';
    return variant === 'light'
      ? profile.floorDecoration?.lightImagePath ?? ''
      : profile.floorDecoration?.darkImagePath ?? '';
  }

  function toggleTag(tagId: string) {
    setSelectedTagIds((current) => {
      if (current.includes(tagId)) return current.filter((id) => id !== tagId);
      return current.length >= 2 ? current : [...current, tagId];
    });
  }

  function removeImage(variant: FloorDecorationVariant) {
    setPendingImages((current) => {
      const next = { ...current };
      delete next[variant];
      return next;
    });
    setDeletedVariants((current) => current.includes(variant) ? current : [...current, variant]);
    setError('');
  }

  async function savePersonalization() {
    if (saving) return;
    setSaving(true);
    setError('');
    try {
      for (const variant of ['light', 'dark'] as const) {
        const pending = pendingImages[variant];
        if (pending) {
          await uploadProfileFloorDecoration(pending.file, variant);
        } else if (deletedVariants.includes(variant)) {
          await deleteProfileFloorDecoration(variant);
        }
      }
      const updatedProfile = await updateProfileDisplayTags(selectedTagIds);
      onSave(updatedProfile);
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : '个性化设置保存失败。');
    } finally {
      setSaving(false);
    }
  }

  const cropSource = cropVariant ? imagePath(cropVariant) : '';

  return createPortal(
    <>
      <div className="profile-dialog-backdrop" role="presentation">
        <button className="profile-dialog-dismiss" type="button" aria-label="关闭个性化设置" onClick={saving ? undefined : onClose} />
        <section className="profile-dialog profile-personalization-dialog" role="dialog" aria-modal="true" aria-labelledby="profile-personalization-title">
          <header>
            <span><Palette size={18} /></span>
            <h2 id="profile-personalization-title">个性化</h2>
            <button aria-label="关闭" disabled={saving} type="button" onClick={onClose}><X size={18} /></button>
          </header>

          <div className="profile-personalization-body">
            <div className="profile-decoration-columns">
              <DecorationColumn
                icon={<Sun size={17} />}
                imageSrc={imagePath('light')}
                label="日间装饰"
                onDelete={() => removeImage('light')}
                onUpload={() => setCropVariant('light')}
                saving={saving}
              />
              <DecorationColumn
                icon={<Moon size={17} />}
                imageSrc={imagePath('dark')}
                label="夜间装饰"
                onDelete={() => removeImage('dark')}
                onUpload={() => setCropVariant('dark')}
                saving={saving}
              />
            </div>

            <section className="profile-personalization-tags" aria-labelledby="profile-personalization-tags-title">
              <h3 id="profile-personalization-tags-title">展示标签</h3>
              <div className="profile-tag-selector">
                {tags.map((tag) => {
                  const selected = selectedTagIds.includes(tag.id);
                  return (
                    <button
                      aria-pressed={selected}
                      disabled={saving || (!selected && selectedTagIds.length >= 2)}
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      type="button"
                    >
                      <TagList selectedTagIds={selected ? [tag.id] : []} tags={[tag]} />
                    </button>
                  );
                })}
                {tags.length === 0 ? <span className="profile-personalization-empty-tags">暂无可选标签</span> : null}
              </div>
            </section>
            {error ? <p className="profile-dialog-error" role="alert">{error}</p> : null}
          </div>

          <footer className="profile-dialog-footer">
            <button className="profile-dialog-cancel" type="button" disabled={saving} onClick={onClose}>取消</button>
            <button className="profile-dialog-confirm" type="button" disabled={saving} onClick={() => { void savePersonalization(); }}>
              <Check size={14} />{saving ? '保存中' : '保存'}
            </button>
          </footer>
        </section>
      </div>

      <AvatarDialog
        avatarSrc={cropSource}
        mode="decoration"
        onClose={() => setCropVariant(null)}
        onSave={async (src) => {
          if (!cropVariant) return;
          const variant = cropVariant;
          const file = await createFloorDecorationFile(src, variant);
          setPendingImages((current) => ({ ...current, [variant]: { file, previewSrc: src } }));
          setDeletedVariants((current) => current.filter((item) => item !== variant));
          setCropVariant(null);
        }}
        open={cropVariant !== null}
        showDefaultOption={false}
      />
    </>,
    document.body,
  );
}

function DecorationColumn({
  icon,
  imageSrc,
  label,
  onDelete,
  onUpload,
  saving,
}: {
  icon: ReactNode;
  imageSrc: string;
  label: string;
  onDelete: () => void;
  onUpload: () => void;
  saving: boolean;
}) {
  return (
    <section className="profile-decoration-column">
      <h3>{icon}{label}</h3>
      <div className="profile-decoration-preview">
        {imageSrc ? <img alt={`${label}预览`} src={imageSrc} /> : <ImagePlus aria-hidden="true" size={28} />}
      </div>
      <div className="profile-decoration-actions">
        <button disabled={saving} type="button" onClick={onUpload}><Upload size={15} />{imageSrc ? '更换' : '上传'}</button>
        <button aria-label={`删除${label}`} disabled={saving || !imageSrc} title={`删除${label}`} type="button" onClick={onDelete}><Trash2 size={15} /></button>
      </div>
    </section>
  );
}
