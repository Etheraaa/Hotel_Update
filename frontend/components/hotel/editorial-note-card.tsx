type EditorialNoteCardProps = {
  note: string;
  logo: string;
};

export default function EditorialNoteCard({ note, logo }: EditorialNoteCardProps) {
  return (
    <aside className="editorial-note">
      <div className="editorial-note__logo">{logo}</div>
      <div>
        <p className="editorial-note__label">编辑部判断</p>
        <p className="editorial-note__text">{note}</p>
      </div>
    </aside>
  );
}
