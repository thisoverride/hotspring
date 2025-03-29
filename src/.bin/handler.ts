import Main from '../main/Main'






export const start =  (arg?: string) => {
  console.log(`Démarrage avec argument: ${arg || 'aucun'}`);
   Main.start(arg ?? '');
};

start(process.argv[2]);
