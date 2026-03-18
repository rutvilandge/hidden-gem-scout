const guard = async () => {
  const session = await window.hgsData?.getSession?.();
  if (!session?.data?.session) {
    const nextTarget = `${window.location.pathname.split('/').pop() || 'explore.html'}${window.location.search || ''}${window.location.hash || ''}`;
    window.location.href = `signin.html?next=${encodeURIComponent(nextTarget)}`;
  }
};

guard();
