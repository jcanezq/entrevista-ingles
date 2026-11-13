// Banco de contenido de la entrevista de ubicación.
// Todo lo que la web muestra sale de este archivo: para agregar o corregir
// preguntas, frases o imágenes se edita AQUÍ, no en app.js.
//
// Campos de cada pregunta:
//   id      identificador único (no cambiarlo: el progreso guardado lo usa)
//   q       la pregunta tal como la diría el entrevistador
//   tema    de qué trata, en español (se usa en el ejercicio de listening)
//   sigue   repreguntas probables del entrevistador
//   niveles respuesta modelo baja / media / alta (se muestran DESPUÉS de responder)
//   ojo     el error típico o el consejo clave para esa pregunta
//   max     segundos para responder (opcional; por defecto el del bloque)

window.BANCO = {
  criterios: [
    { id: "fluidez", nombre: "Fluidez", ayuda: "Hablé sin silencios largos; si dudé, usé una frase para ganar tiempo." },
    { id: "extension", nombre: "Extensión (R-A-R-P)", ayuda: "Respondí, amplié, di una razón o ejemplo y cerré con un puente." },
    { id: "rango", nombre: "Rango", ayuda: "Usé varios tiempos verbales, conectores y vocabulario preciso." },
    { id: "correccion", nombre: "Corrección", ayuda: "Evité los errores típicos (I have 30 years, I go last weekend…)." },
    { id: "pronunciacion", nombre: "Pronunciación", ayuda: "Se me entendió: terminé las palabras (-ed, -s) y no hablé en tono plano." }
  ],

  rarp: [
    { letra: "R", nombre: "Responde", detalle: "Contesta directo lo que te preguntaron." },
    { letra: "A", nombre: "Amplía", detalle: "Agrega un detalle concreto: dónde, cuándo, con quién." },
    { letra: "R", nombre: "Razón o ejemplo", detalle: "because…, for example…, which…" },
    { letra: "P", nombre: "Puente", detalle: "Una frase final que abra la siguiente pregunta." }
  ],

  bloques: [
    {
      id: 1,
      nombre: "Personal",
      mide: "Presente, pasado y futuro básicos",
      prep: 3,
      max: 45,
      preguntas: [
        {
          id: "p1", q: "What is your name?", tema: "Su nombre",
          sigue: ["How do you spell your last name?", "Does your name have a special meaning?"],
          niveles: {
            bajo: "Ana.",
            medio: "My name is Ana Quispe.",
            alto: "My name is Ana Quispe, but most people call me Anita. My last name is spelled Q-U-I-S-P-E."
          },
          ojo: "Practica deletrear tu nombre: en inglés la A suena /ei/, la E /i:/ y la I /ai/."
        },
        {
          id: "p2", q: "Where are you from?", tema: "Su lugar de origen",
          sigue: ["What's it like?", "How long have you lived there?", "What would you recommend a visitor to do there?"],
          niveles: {
            bajo: "I'm from Huancayo.",
            medio: "I'm from Huancayo, a city in the central highlands of Peru. It's quite cold, but it's very nice.",
            alto: "I'm from Huancayo, in the central highlands of Peru. I've lived there all my life, so I know it really well. It's a busy city, but you can get to the countryside in twenty minutes, which is what I like most about it."
          },
          ojo: "I have lived here since 10 years → I've lived here FOR 10 years (since 2016)."
        },
        {
          id: "p3", q: "What do you do?", tema: "A qué se dedica",
          sigue: ["Do you enjoy it?", "Why did you choose it?"],
          niveles: {
            bajo: "I'm student.",
            medio: "I'm a student, and I also work at a construction company.",
            alto: "I'm doing two things at the moment: I'm studying civil engineering, and I work full-time as an assistant at a construction company. It's tiring, but I like the fact that I can apply at work what I learn in class."
          },
          ojo: "I'm student → I'm A student. En inglés la profesión siempre lleva a/an."
        },
        {
          id: "p4", q: "What did you do last weekend?", tema: "Su fin de semana pasado",
          sigue: ["Who did you go with?", "How was it?", "Is that what you usually do on weekends?"],
          niveles: {
            bajo: "I go to my parents' house.",
            medio: "Last weekend I visited my parents. We had lunch together and watched a movie.",
            alto: "Last weekend I went back home to visit my parents, which I try to do at least once a month. We cooked lunch together, and on Sunday I had to finish a report for work, so it was a mix of rest and responsibility."
          },
          ojo: "Es la pregunta que comprueba el PASADO: went, had, saw, ate. Nunca 'I go last weekend'."
        },
        {
          id: "p5", q: "What do you like to do in your free time?", tema: "Su tiempo libre",
          sigue: ["How often do you do that?", "How long have you been doing it?", "Who do you do it with?"],
          niveles: {
            bajo: "I like play football.",
            medio: "In my free time I like playing football with my friends and watching series.",
            alto: "To be honest, I don't have much free time because I work and study, but when I do, I usually play football with some friends on Sunday mornings. I've been playing in the same team for about five years, so it's more about friendship than the game itself."
          },
          ojo: "I like play → I like playing / I like to play. Para costumbres: 'I usually…', no 'I use to…'."
        },
        {
          id: "p6", q: "Can you tell me a little bit about yourself?", tema: "Presentarse", max: 90,
          sigue: ["Why are you learning English?", "What are your strengths?"],
          niveles: {
            bajo: "My name is Ana. I have 25 years. I'm student.",
            medio: "My name is Ana, I'm 25 and I'm from Huancayo. I'm studying civil engineering and I work at a construction company. I like hiking.",
            alto: "Sure. My name is Ana, I'm 25 and I'm from Huancayo. I'm in my eighth semester of civil engineering, and at the same time I work as an assistant at a construction company, mainly checking quantities and preparing reports. I'm quite an organized person, which helps a lot when you have to combine work and study. In my free time I like hiking with friends. And right now I'm focusing on my English, because I'd like to work on international projects in the future."
          },
          ojo: "La más importante de todas. Llévala preparada (60–90 s) pero NO memorizada palabra por palabra: se nota y baja el puntaje. I have 25 years → I'm 25."
        },
        {
          id: "p7", q: "What are you studying?", tema: "Lo que estudia",
          sigue: ["Why did you choose it?", "What's the hardest course?", "What do you want to do after you graduate?"],
          niveles: {
            bajo: "I study the career of civil engineering.",
            medio: "I'm studying civil engineering. I'm in my sixth semester.",
            alto: "I'm studying civil engineering, and I'm in my sixth semester. I chose it because my father is a builder, so I grew up visiting construction sites. The hardest part so far has been structural analysis, but it's also the course I've enjoyed the most."
          },
          ojo: "'the career of' es calco del español. Di 'I'm studying civil engineering' o 'I'm doing a degree in…'. Career = trayectoria profesional."
        },
        {
          id: "p8", q: "Where do you work?", tema: "Dónde trabaja",
          sigue: ["How long have you worked there?", "How do you get to work?"],
          niveles: {
            bajo: "In a company of construction.",
            medio: "I work at a construction company in Huancayo.",
            alto: "I work at a medium-sized construction company in Huancayo. I've been there for almost two years, and I started as an intern, so I've grown a lot in that time."
          },
          ojo: "a company of construction → a construction company (el sustantivo que describe va ANTES)."
        },
        {
          id: "p9", q: "What do you do in your job?", tema: "Sus funciones en el trabajo",
          sigue: ["What's a typical day like?", "What do you like most about your job?", "Is there anything you don't like?"],
          niveles: {
            bajo: "I work in office.",
            medio: "I'm an assistant. I prepare reports and I go to the construction site.",
            alto: "I'm an assistant engineer, so my day is usually split between the office and the site. In the morning I check quantities and prepare reports, and in the afternoon I often go to the site to supervise the work. What I like most is that every day is different."
          },
          ojo: "I work like assistant → I work AS an assistant."
        },
        {
          id: "p10", q: "What are your plans for next year?", tema: "Sus planes para el próximo año",
          sigue: ["Why is that important to you?", "What do you need to do to achieve that?", "Why are you learning English?"],
          niveles: {
            bajo: "I will to finish my career.",
            medio: "I'm going to finish my degree, and I want to get a better job.",
            alto: "I'm planning to finish my degree by the end of next year. After that, I'd like to work on bigger projects, and that's actually one of the reasons I'm improving my English, because a lot of technical documentation is in English."
          },
          ojo: "Es la pregunta que comprueba el FUTURO: I'm going to…, I'm planning to…, I'd like to…, I hope to… Nunca 'I will to'."
        }
      ]
    },
    {
      id: 2,
      nombre: "Gustos y experiencias",
      mide: "Pasado simple frente a present perfect; narrar",
      prep: 5,
      max: 60,
      preguntas: [
        {
          id: "e1", q: "Do you practice any sports?", tema: "Los deportes",
          sigue: ["How often do you do it?", "Have you ever played in a competition?", "Did you play any sports when you were a child?"],
          niveles: {
            bajo: "Yes, football.",
            medio: "Yes, I play football twice a week with my friends.",
            alto: "Not as much as I'd like to. I used to play volleyball a lot at school, but now that I work, I mostly go running two or three times a week, early in the morning. It's the only time of the day I have for myself."
          },
          ojo: "'I used to' = antes sí y ahora no. 'I usually' = ahora, de costumbre. No los mezcles."
        },
        {
          id: "e2", q: "Tell me about your experiences when traveling outside your city.", tema: "Sus viajes fuera de su ciudad", max: 90,
          sigue: ["What was the best trip you've ever taken?", "Did anything go wrong?", "Where would you like to travel next?"],
          niveles: {
            bajo: "I go to Cusco.",
            medio: "I've been to Cusco and Arequipa. I went to Cusco last year with my family and it was beautiful.",
            alto: "I've traveled around Peru quite a bit, mostly for work. The most memorable trip was to Cusco last year with my family. We did the Inca Trail, which was harder than I expected, and on the second day it started raining heavily, so we had to walk for hours completely wet. Even so, arriving at Machu Picchu was worth it. Next, I'd love to visit the north, especially Chachapoyas."
          },
          ojo: "Con fecha → pasado simple: I went to Cusco last year. Sin fecha → present perfect: I've been to Cusco. Nunca 'I have gone to Cusco last year'."
        },
        {
          id: "e3", q: "What kind of music do you like?", tema: "La música que le gusta",
          sigue: ["Who's your favorite artist?", "Has your taste in music changed over the years?", "When do you usually listen to music?"],
          niveles: {
            bajo: "I like rock.",
            medio: "I like rock and some Latin music, like salsa.",
            alto: "I'm quite open, but I'd say I mostly listen to rock, especially Peruvian bands from the nineties. My taste has changed a lot, though: when I was a teenager I only listened to reggaeton, and now I listen to almost everything except that."
          },
          ojo: "Si te preguntan 'Has your taste changed?', responde en present perfect: 'Yes, it has changed a lot'."
        },
        {
          id: "e4", q: "Have you ever been to a live concert?", tema: "Los conciertos en vivo",
          sigue: ["Who did you see?", "What was it like?", "Would you go again?"],
          niveles: {
            bajo: "Yes, I go to a concert.",
            medio: "Yes, I've been to a few. The last one was a rock concert in Lima.",
            alto: "Yes, a few times. The best one was a concert in Lima two years ago. We waited in line for almost four hours, but the atmosphere was amazing: everybody was singing every song. The only bad part was getting home at three in the morning and having to work the next day."
          },
          ojo: "Empieza con present perfect ('Yes, I've been to a few') y cuenta el último en pasado simple ('The last one WAS…')."
        },
        {
          id: "e5", q: "What's your favorite food?", tema: "Su comida favorita",
          sigue: ["Can you cook it?", "Is there any food you don't like?"],
          niveles: {
            bajo: "Ceviche.",
            medio: "My favorite food is ceviche. I usually eat it on Sundays.",
            alto: "That's a hard one, but I'd say ceviche. It's fresh and spicy, and for me it's connected with family Sundays. I can't make it as well as my mother does, though; I've tried a few times and it's never quite the same."
          },
          ojo: "'That's a hard one, but I'd say…' es una forma natural de ganar dos segundos."
        },
        {
          id: "e6", q: "Tell me about a person you admire.", tema: "Una persona que admira",
          sigue: ["Why do you admire this person?", "How has this person influenced you?"],
          niveles: {
            bajo: "My mother.",
            medio: "I admire my mother because she works very hard.",
            alto: "I'd say my mother. She raised three children on her own while running a small business, and she never complained. I think I got my discipline from her: whenever I feel tired of working and studying at the same time, I remember what she did."
          },
          ojo: "'How has this person influenced you?' → present perfect: 'She has taught me…'."
        },
        {
          id: "e7", q: "How do you use technology in your daily life?", tema: "La tecnología en su día a día",
          sigue: ["Could you live without your phone?", "Do you think you spend too much time online?"],
          niveles: {
            bajo: "I use phone.",
            medio: "I use my phone and my laptop for work and to study.",
            alto: "Pretty much all day, to be honest. I use my phone to organize my week, to study, and of course for WhatsApp, which is basically how my job works. I've tried to reduce the time I spend on social media, though, because I realized it was eating up my study time."
          },
          ojo: "Una pregunta hipotética como 'Could you live without…?' se responde con would/could: 'I don't think I could, because…'."
        },
        {
          id: "e8", q: "What did you do on your last vacation?", tema: "Sus últimas vacaciones",
          sigue: ["Who did you go with?", "What was the best part?", "Would you go back?"],
          niveles: {
            bajo: "I go to beach.",
            medio: "On my last vacation I went to the beach with my friends for three days.",
            alto: "My last real vacation was last February. A group of friends and I rented a house near the beach in the north for a week. We didn't do much apart from swimming, eating and sleeping, which was exactly what I needed after a long semester."
          },
          ojo: "Repasa los irregulares: go → went, eat → ate, swim → swam, take → took, buy → bought."
        }
      ]
    },
    {
      id: 3,
      nombre: "Imágenes",
      mide: "Describir, especular y explicar lo inusual",
      prep: 10,
      max: 60,
      preguntas: [] // las imágenes viven en BANCO.imagenes
    },
    {
      id: 4,
      nombre: "Opinión",
      mide: "Argumentar, matizar y ver los dos lados",
      prep: 15,
      max: 90,
      preguntas: [
        {
          id: "o1", q: "What's your opinion about the economic situation?", tema: "La situación económica",
          sigue: ["What do you think the government should do?", "How does it affect young people?"],
          niveles: {
            bajo: "The economy is bad.",
            medio: "I think the economic situation is difficult because prices are high and there aren't many good jobs.",
            alto: "I'd say it's quite challenging, although it's not all negative. On the one hand, prices have gone up a lot, so many families are struggling, and a lot of young people can only find informal jobs. On the other hand, some sectors, like agriculture for export, are growing and creating opportunities. So overall, I think the problem isn't only the economy itself but how the benefits are distributed."
          },
          ojo: "No evalúan cuánto sabes de economía, sino si puedes argumentar. Evita posturas políticas tajantes: ponen nervioso y hacen tropezar. Vocabulario: cost of living, prices, salaries, informal jobs, unemployment, investment."
        },
        {
          id: "o2", q: "Do you think social media has a positive or a negative effect on people?", tema: "El efecto de las redes sociales",
          sigue: ["How much time do you spend on social media?", "Should children use social media?"],
          niveles: {
            bajo: "Negative.",
            medio: "I think it's positive and negative. It's good for communication, but people spend too much time on it.",
            alto: "It depends on how you use it. It's great for staying in touch and even for learning, but I think the problem is that it's designed to keep you scrolling. I've noticed it myself: if I'm not careful, I lose an hour without realizing it."
          },
          ojo: "'It depends on…' (no 'depends of'). Muy útil para matizar."
        },
        {
          id: "o3", q: "Is it better to work from home or at the office?", tema: "Trabajo remoto frente a la oficina",
          sigue: ["Which do you prefer?", "Is remote work possible in your job?"],
          niveles: {
            bajo: "Home is better.",
            medio: "I prefer working from home because I don't waste time in traffic.",
            alto: "I'd say a mix of both is ideal. Working from home saves a lot of time, especially in a city with heavy traffic, but you lose the contact with your colleagues, and in my field you can't supervise a site from your living room."
          },
          ojo: "Para comparar: better than, more comfortable than, not as… as… Nunca 'more better'."
        },
        {
          id: "o4", q: "Should university education be free?", tema: "Si la universidad debería ser gratuita",
          sigue: ["Who should pay for it?", "Is education in your country good?"],
          niveles: {
            bajo: "Yes.",
            medio: "Yes, I think it should be free, because many people can't pay for it.",
            alto: "In principle, I think it should be, because talent shouldn't depend on how much money your family has. That said, free education only works if it's well funded; otherwise you end up with free universities that don't have enough teachers or labs."
          },
          ojo: "'That said, …' y 'In principle, …' suben de nivel inmediatamente."
        },
        {
          id: "o5", q: "Is it better to live in a big city or in a small town?", tema: "La gran ciudad frente al pueblo",
          sigue: ["Where would you like to live in the future?", "What's the main problem of big cities?"],
          niveles: {
            bajo: "City.",
            medio: "I prefer a big city because there are more jobs and universities.",
            alto: "For me, right now, a big city, simply because that's where the jobs and universities are. But if I could work remotely, I'd probably move to a smaller town: the air is cleaner, life is cheaper and you don't spend two hours a day in traffic."
          },
          ojo: "Condicional: 'If I could…, I'd…'. Es la estructura que más muestra nivel en este bloque."
        },
        {
          id: "o6", q: "How important is it to speak English nowadays?", tema: "La importancia del inglés",
          sigue: ["Why are you learning English?", "What's the most difficult part of learning English for you?"],
          niveles: {
            bajo: "Very important.",
            medio: "It's very important because many companies need people who speak English.",
            alto: "I'd say it's essential, especially in technical fields. Most of the software, manuals and research we use are in English, so if you don't speak it, you depend on translations, which are often late or wrong. For me, the hardest part has been listening, so I'm working on that."
          },
          ojo: "Pregunta casi segura en una entrevista de idioma. Ten una razón PERSONAL lista."
        },
        {
          id: "o7", q: "Do you think technology will replace many jobs in the future?", tema: "La tecnología y el empleo",
          sigue: ["Could your job be done by a machine?", "What skills will be important in the future?"],
          niveles: {
            bajo: "Yes, robots.",
            medio: "Yes, I think artificial intelligence will replace some jobs, but it will also create new ones.",
            alto: "Some jobs, definitely, especially repetitive ones. But I think it's more likely that technology will change most jobs rather than replace them. In engineering, for example, software already does many calculations, but someone still has to understand the results and take responsibility for them."
          },
          ojo: "Para el futuro con duda: 'it's likely that…', 'it might…', 'I doubt that…'."
        },
        {
          id: "o8", q: "What's the biggest environmental problem in your city?", tema: "El problema ambiental de su ciudad",
          sigue: ["What could people do about it?", "Who is responsible for solving it?"],
          niveles: {
            bajo: "Garbage.",
            medio: "I think the biggest problem is garbage, because there is a lot in the streets and in the river.",
            alto: "I'd say waste management. There's a lot of garbage in the streets, and some of it ends up in the river. Part of the problem is the lack of infrastructure, but it's also about habits: if people don't separate their waste, even a good system won't work."
          },
          ojo: "Vocabulario útil: pollution, waste, recycling, air quality, water supply."
        },
        {
          id: "o9", q: "Do young people today have it easier or harder than their parents did?", tema: "Los jóvenes de hoy frente a sus padres",
          sigue: ["In what way?", "What would your parents say?"],
          niveles: {
            bajo: "Easier.",
            medio: "I think it's easier in some ways, because we have technology, but it's harder to buy a house.",
            alto: "In some ways it's easier: we have access to information our parents could only dream of. But in other ways it's harder. My parents bought their house when they were thirty; for my generation, that seems almost impossible."
          },
          ojo: "Compara pasado y presente: 'When my parents were young, they used to…, but nowadays…'."
        },
        {
          id: "o10", q: "Is it possible to study and work at the same time successfully?", tema: "Estudiar y trabajar a la vez",
          sigue: ["How do you organize your time?", "What advice would you give someone who wants to do it?"],
          niveles: {
            bajo: "Yes, it's possible.",
            medio: "Yes, it's possible, but it's very difficult. You need to be organized.",
            alto: "It's possible, but it comes at a price. I've been doing it for three years, and what makes it work is planning the week in advance and being realistic: you can't do everything perfectly, so you have to decide what matters most each week."
          },
          ojo: "Si lo vives, dilo: una experiencia personal convierte una opinión en una respuesta de nivel alto."
        }
      ]
    }
  ],

  // Bloque 3. Cada imagen se guarda en la carpeta img/ con el nombre de 'archivo'.
  // Mientras 'archivo' sea null la imagen no aparece en la práctica; 'idea' dice
  // qué foto buscar (Unsplash o Pexels, cuya licencia permite usarlas).
  imagenes: [
    { id: "i01", tipo: "habitual", idea: "Una familia almorzando en casa", archivo: null },
    { id: "i02", tipo: "habitual", idea: "Gente esperando el bus bajo la lluvia", archivo: null },
    { id: "i03", tipo: "habitual", idea: "Estudiantes en una biblioteca", archivo: null },
    { id: "i04", tipo: "habitual", idea: "Un mercado con puestos de fruta", archivo: null },
    { id: "i05", tipo: "habitual", idea: "Obreros en una obra de construcción", archivo: null },
    { id: "i06", tipo: "habitual", idea: "Una persona trabajando con su laptop en un café", archivo: null },
    { id: "i07", tipo: "habitual", idea: "Niños jugando fútbol en un parque", archivo: null },
    { id: "i08", tipo: "habitual", idea: "Tráfico en hora punta", archivo: null },
    { id: "i09", tipo: "habitual", idea: "Una consulta médica", archivo: null },
    { id: "i10", tipo: "habitual", idea: "Gente haciendo cola en un banco", archivo: null },
    { id: "i11", tipo: "inusual", idea: "Un hombre de terno nadando en una piscina", archivo: null },
    { id: "i12", tipo: "inusual", idea: "Una vaca en medio de una calle de la ciudad", archivo: null },
    { id: "i13", tipo: "inusual", idea: "Alguien trabajando con su laptop en la playa", archivo: null },
    { id: "i14", tipo: "inusual", idea: "Un perro sentado al volante de un auto", archivo: null },
    { id: "i15", tipo: "inusual", idea: "Una novia corriendo una maratón", archivo: null },
    { id: "i16", tipo: "inusual", idea: "Una oficina inundada con gente trabajando", archivo: null },
    { id: "i17", tipo: "inusual", idea: "Un piano en medio del bosque", archivo: null },
    { id: "i18", tipo: "inusual", idea: "Alguien haciendo yoga en medio de una oficina", archivo: null },
    { id: "i19", tipo: "inusual", idea: "Un auto lleno de globos", archivo: null },
    { id: "i20", tipo: "inusual", idea: "Un chef cocinando en la cima de una montaña", archivo: null }
  ],

  imagenPreguntas: {
    inicio: "What can you tell me about this picture?",
    sigue: [
      "What do you think happened before this picture was taken?",
      "Why do you think this is happening?",
      "Have you ever been in a situation like this?",
      "Is this common in your country?",
      "Would you like to be there? Why or why not?"
    ]
  },

  imagenPasos: [
    { paso: "Panorama", frases: ["This picture shows…", "It looks like it was taken in…"] },
    { paso: "Detalles y ubicación", frases: ["In the foreground…", "In the background…", "On the left / On the right…"] },
    { paso: "Acción (presente continuo)", frases: ["A man is…", "They seem to be…", "Some people are…"] },
    { paso: "Especular", frases: ["He might be…", "Maybe they're… because…", "It looks as if…", "I'd guess that…"] },
    { paso: "Lo inusual y por qué", frases: ["What's unusual is that…", "Normally you'd expect…", "Perhaps this happened because…"] },
    { paso: "Toque personal", frases: ["I've never seen anything like this, but…", "If I were there, I'd…"] }
  ],

  frases: [
    {
      grupo: "Rescate: no entendí la pregunta",
      nota: "Pedir que repitan NO baja la nota. Quedarse callado sí.",
      items: ["Sorry, could you repeat the question, please?", "Sorry, I didn't catch that.", "Do you mean…?", "Could you say that a bit more slowly, please?", "Sorry, the connection broke up for a second. Could you repeat that?"]
    },
    {
      grupo: "Ganar tiempo",
      nota: "Dos o tres segundos con una frase suenan naturales; tres segundos callado, no.",
      items: ["That's a good question, let me think…", "That's a hard one, but I'd say…", "Well, it depends…", "Hmm, I've never really thought about that, but…", "Let me see…"]
    },
    {
      grupo: "Ampliar la respuesta",
      nota: "Son los conectores que convierten una frase en una respuesta.",
      items: ["because…", "for example… / for instance…", "which means that…", "and the reason is that…", "actually,… (= en realidad)", "the thing is,…", "what I like most is…"]
    },
    {
      grupo: "Dar una opinión",
      nota: "Matizar sube de nivel; ser tajante, no.",
      items: ["In my opinion,…", "I'd say that…", "As far as I know,…", "On the one hand,… On the other hand,…", "That said,…", "It's hard to say, but…", "So overall, I think…"]
    },
    {
      grupo: "Especular (imágenes)",
      nota: "Nunca afirmes como seguro algo que solo supones.",
      items: ["It looks like…", "He might be… / They could be…", "It seems that…", "I'd guess that…", "Perhaps… / Maybe…"]
    },
    {
      grupo: "Cerrar y conectar",
      nota: "Un cierre corto le dice al entrevistador que terminaste.",
      items: ["So that's basically it.", "…and that's why I'm learning English.", "…but that's something I'd like to change.", "Anyway, that's my experience."]
    }
  ],

  errores: [
    ["I have 30 years", "I'm 30"],
    ["I'm studying the career of civil engineering", "I'm studying civil engineering"],
    ["I work like an engineer", "I work as an engineer"],
    ["a company of construction", "a construction company"],
    ["Last weekend I go to…", "Last weekend I went to…"],
    ["I have gone to Cusco last year", "I went to Cusco last year"],
    ["I like play football", "I like playing football"],
    ["I will to travel", "I'm going to travel / I'd like to travel"],
    ["My plans is…", "My plans are…"],
    ["People is…", "People are…"],
    ["I am agree", "I agree"],
    ["It depends of…", "It depends on…"],
    ["more better", "better"],
    ["I live here since 5 years", "I've lived here for 5 years"],
    ["I'm student", "I'm a student"],
    ["The life is expensive", "Life is expensive"],
    ["Explain me…", "Explain to me…"],
    ["I assist to class", "I attend class"],
    ["Actually I work at… (= actualmente)", "Currently I work at… / At the moment I work at…"],
    ["I'm boring", "I'm bored (boring = aburrido como persona)"],
    ["I use to play football on Sundays", "I usually play football on Sundays"],
    ["in the weekend", "on the weekend / at the weekend"]
  ],

  pronunciacion: [
    "Los pasados en -ed: worked /t/, played /d/, visited /id/. No digas 'work-ed'.",
    "No agregues una 'e' delante de s+consonante: 'study', no 'estudy'; 'Spain', no 'Espain'.",
    "Las 's' finales importan: 'he works', 'two years'.",
    "Engineer se acentúa al final: en-gi-NEER. Develop, en el medio: de-VEL-op.",
    "Si dudas al pronunciar una palabra, usa otra que domines. Nadie te pide la más difícil."
  ],

  meet: [
    "Usa audífonos con micrófono: evitas el eco y entiendes mejor.",
    "Prueba cámara y micrófono en meet.google.com antes de la hora.",
    "Luz de frente (una ventana o lámpara detrás de la cámara, nunca detrás de ti).",
    "La cámara a la altura de los ojos; mira a la cámara al responder, no a tu propia imagen.",
    "Pon tu nombre completo en tu cuenta de Meet.",
    "Ten los datos móviles listos por si se cae el wifi, y el enlace abierto en el celular.",
    "Si la conexión se corta: 'Sorry, the connection broke up. Could you repeat the question?'",
    "Cierra todas las demás pestañas y aplicaciones, y silencia las notificaciones.",
    "Conéctate cinco minutos antes, con agua a la mano."
  ]
};
