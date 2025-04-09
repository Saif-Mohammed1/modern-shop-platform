const layout = ({children, model}: {children: React.ReactNode; model: React.ReactNode}) => {
  return (
    <>
      {children}
      {model}
    </>
  );
};

export default layout;
