type Props = {
  title: string;
  subtitle: string;
};

const HomeSectionTitle = ({ title, subtitle }: Props) => {
  return (
    <div className="mb-10 text-left">
      <h2 className="section-title">{title}</h2>
      <p className="section-subtitle">{subtitle}</p>
    </div>
  );
};

export default HomeSectionTitle;