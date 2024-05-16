if (annyang) {
    const commands = {
      'first exercise': () => {
        const exercisesString = localStorage.getItem('exercises');// Pridobim podatke iz lokalne shrambe
        if (exercisesString) {
          const exercises = JSON.parse(exercisesString);
          if (exercises.length > 0) {  // preverim, da polje excercises ni prazno
            const firstExercise = exercises[0];// s tem pridobim prvo vajo
            const msg = new SpeechSynthesisUtterance(// izgradim sporočilo
              `Exercise: ${firstExercise.name}. Description: ${firstExercise.description}. Duration: ${firstExercise.duration} minutes. Calories: ${firstExercise.calories}. Type: ${firstExercise.type}. Difficulty: ${firstExercise.difficulty}.`
            );
            window.speechSynthesis.speak(msg);// izgovorjava sporočila
          } else {
            const errorMsg = new SpeechSynthesisUtterance('Se opravičujem, vaje nisem uspel najti.');// kaj naredi, če ne najde vaje
            window.speechSynthesis.speak(errorMsg);
          }
        } else {
          const errorMsg = new SpeechSynthesisUtterance('Se opravičujem, nisem uspel najti vaje v lokalni shrambi.');// če vaje ni v lokalni shrambi
          window.speechSynthesis.speak(errorMsg);
        }
      }
    };
    annyang.addCommands(commands);// dodamo ukaz anyangu
    SpeechKITT.annyang();// SpeechKITT povemo, da uporabi anyang
    SpeechKITT.setStylesheet('//cdnjs.cloudflare.com/ajax/libs/SpeechKITT/0.3.0/themes/flat.css');// definiram stylesheet za SpeechKITT 
    SpeechKITT.vroom();// prikažem SpeechKITT's vmesnik
  }
  if (annyang) {
    const commands = {
      'last exercise': () => {
        const exercisesString = localStorage.getItem('exercises');
        if (exercisesString) {
          const exercises = JSON.parse(exercisesString);
          if (exercises.length > 0) {
            const lastExercise = exercises[exercises.length - 1];
            const msg = new SpeechSynthesisUtterance(
              `Exercise: ${lastExercise.name}. Description: ${lastExercise.description}. Duration: ${lastExercise.duration} minutes. Calories: ${lastExercise.calories}. Type: ${lastExercise.type}. Difficulty: ${lastExercise.difficulty}.`
            );
            window.speechSynthesis.speak(msg);
          } else {
            const errorMsg = new SpeechSynthesisUtterance('Se opravičujem, vaje nisem uspel najti.');
            window.speechSynthesis.speak(errorMsg);
          }
        } else {
          const errorMsg = new SpeechSynthesisUtterance('Se opravičujem, nisem uspel najti vaje v lokalni shrambi.');
          window.speechSynthesis.speak(errorMsg);
        }
      }
    };
    annyang.addCommands(commands);
    SpeechKITT.annyang();
    SpeechKITT.setStylesheet('//cdnjs.cloudflare.com/ajax/libs/SpeechKITT/0.3.0/themes/flat.css');
    SpeechKITT.vroom();
  }
  if (annyang) {
    const commands = {
      'random exercise': () => {
        const exercisesString = localStorage.getItem('exercises');
        if (exercisesString) {
          const exercises = JSON.parse(exercisesString);
          if (exercises.length > 0) {
            const randomIndex = Math.floor(Math.random() * exercises.length);//da dobim naključno vajo
            const randomExercise = exercises[randomIndex];
            const msg = new SpeechSynthesisUtterance(
              `Exercise: ${randomExercise.name}. Description: ${randomExercise.description}. Duration: ${randomExercise.duration} minutes. Calories: ${randomExercise.calories}. Type: ${randomExercise.type}. Difficulty: ${randomExercise.difficulty}.`
            );
            window.speechSynthesis.speak(msg);
          } else {
            const errorMsg = new SpeechSynthesisUtterance('Se opravičujem, vaje nisem uspel najti.');
            window.speechSynthesis.speak(errorMsg);
          }
        } else {
          const errorMsg = new SpeechSynthesisUtterance('Se opravičujem, nisem uspel najti vaje v lokalni shrambi.');
          window.speechSynthesis.speak(errorMsg);
        }
      }
    };
    annyang.addCommands(commands);
    SpeechKITT.annyang();
    SpeechKITT.setStylesheet('//cdnjs.cloudflare.com/ajax/libs/SpeechKITT/0.3.0/themes/flat.css');
    SpeechKITT.vroom();
  }
  if (annyang) {
    const commands = {
      'exercise number': () => {
        const exercisesString = localStorage.getItem('exercises');
        if (exercisesString) {
          const exercises = JSON.parse(exercisesString);
          if (exercises.length > 0) {
            // v okno, ki se pojavi vnesem koliko vaj želim, da izgovori
            annyang.pause(); // tačas, ko vnašam se anyang zaustavi, da ne bi po pomoti zaznaval galsovnih ukazov med tem
            const numberOfExercises = prompt('Koliko vaj želite?', '1');
            annyang.resume(); // po tem nadaljujem
            if (!isNaN(numberOfExercises) && numberOfExercises > 0) {
              for (let i = 0; i < numberOfExercises; i++) {
                const randomIndex = Math.floor(Math.random() * exercises.length);
                const randomExercise = exercises[randomIndex];
                const msg = new SpeechSynthesisUtterance(
                  `Exercise: ${randomExercise.name}. Description: ${randomExercise.description}. Duration: ${randomExercise.duration} minutes. Calories: ${randomExercise.calories}. Type: ${randomExercise.type}. Difficulty: ${randomExercise.difficulty}.`
                );
                window.speechSynthesis.speak(msg);
              }
              const confirmationMsg = new SpeechSynthesisUtterance('Here are your random exercises! Enjoy your workout!');
              window.speechSynthesis.speak(confirmationMsg);
            } else {
              const errorMsg = new SpeechSynthesisUtterance('Invalid input. Please provide a valid number.');
              window.speechSynthesis.speak(errorMsg);
            }
          } else {
            const errorMsg = new SpeechSynthesisUtterance('Se opravičujem, vaje nisem uspel najti.');
            window.speechSynthesis.speak(errorMsg);
          }
        } else {
          const errorMsg = new SpeechSynthesisUtterance('Se opravičujem, nisem uspel najti vaje v lokalni shrambi.');
          window.speechSynthesis.speak(errorMsg);
        }
      }
    };  
    annyang.addCommands(commands);
    SpeechKITT.annyang();
    SpeechKITT.setStylesheet('//cdnjs.cloudflare.com/ajax/libs/SpeechKITT/0.3.0/themes/flat.css');
    SpeechKITT.vroom();
  }

  //----------------------------KLIC ZA IZBRIS (PONOVNO DOOČIM FUNKCIJE)----------------------------------------------
  const brisiVajo = async (exerciseId, token) => {
    try {
      const response = await axios.delete(`${baseURL}/exercises/${exerciseId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      handleError(error);
      return null;
    }
};

const preveriVeljavnostTokena = async (token) => {
  try {
      const response = await axios.get(`${authURL}/verify-token`, {
          headers: {
              Authorization: `Bearer ${token}`
          }
      });
      return response.data.valid;
  } catch (error) {
      console.error('Napaka pri avtentikaciji', error);
      return false;
  }
};

const osveziToken = async (oldToken) => {
  try {
      const response = await axios.post(`${authURL}/refresh-token`, { token: oldToken });
      return response.data.newToken;
  } catch (error) {
      console.error('Napaka pri osveževanju tokena', error);
      return null;
  }
};

if (annyang) {
  const deleteCommands = {
    'delete random': async () => {
      const exercisesString = localStorage.getItem('exercises');
      const token = localStorage.getItem('token');
      if (exercisesString && token) {
        const exercises = JSON.parse(exercisesString);
        if (exercises.length > 0) {
          const randomIndex = Math.floor(Math.random() * exercises.length);
          const randomExercise = exercises[randomIndex];
          try {
            const isValid = await preveriVeljavnostTokena(token);
            if (!isValid) {
              const newToken = await osveziToken(token);   
              if (newToken) {
                localStorage.setItem('token', newToken);
                console.log('Token osvežen', newToken);
                await brisiVajo(randomExercise._id, newToken);
                console.log(`Vaja z id ${randomExercise._id} uspešno izbrisana.`);
              } else {
                console.error('Ni bilo mogoče osvežiti tokena');
              }
            } else {
              await brisiVajo(randomExercise._id, token);
              console.log(`Vaja z id ${randomExercise._id} uspešno izbrisana.`);
            }
          } catch (error) {
            console.error('Napaka pri brisanju vaje', error);
          }
        } else {
          console.log('Vaja ne obstaja');
        }
      } else {
        console.error('V lokalni shrambi ni vaje ali tokena');
      }
    }
  };
  annyang.addCommands(deleteCommands);
  SpeechKITT.annyang();
  SpeechKITT.setStylesheet('//cdnjs.cloudflare.com/ajax/libs/SpeechKITT/0.3.0/themes/flat.css');
  SpeechKITT.vroom();
}

  