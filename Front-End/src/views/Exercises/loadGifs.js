function importAll(r) {
    let images = {};
    r.keys().forEach((item) => {
      const key = item.replace('./', '').replace('.gif', '');
      images[key] = r(item);
    });
    return images;//to potrebujem, da mi dinamično nalaga hash in kliče slike (gife)
  }
  
  const gifs = importAll(require.context('../Exercises/gifs', false, /\.gif$/));
  
  export default gifs;