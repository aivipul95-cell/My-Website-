import ImageDropzone from '../ImageDropzone';
import ImageThumbs from '../ImageThumbs';
import { deleteImages } from '../../db/db';

export default function GalleryBlock({ data, onChange }) {
  const ids = data.imageIds || [];
  return (
    <div className="space-y-3">
      <ImageThumbs
        ids={ids}
        size="lg"
        onRemove={async (id) => {
          onChange({ imageIds: ids.filter((x) => x !== id) });
          await deleteImages([id]);
        }}
      />
      <ImageDropzone owner="gallery" compact={ids.length > 0} onAdded={(newIds) => onChange({ imageIds: [...ids, ...newIds] })} />
    </div>
  );
}
