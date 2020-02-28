const fs = require("fs");

const lib = {
  create: function(dir, filename, data, callback) {
    const pathToOpen = `${this.baseDirectory}/${dir}/${filename}.json`;

    fs.open(pathToOpen, "wx", (openError, fileDescriptor) => {
      if (!openError && fileDescriptor) {
        const fileContent = JSON.stringify(data);

        fs.writeFile(fileDescriptor, fileContent, writeError => {
          if (!writeError) {
            fs.close(fileDescriptor, closeError => {
              if (!closeError) {
                callback(false);
              } else {
                callback(closeError);
              }
            });
          } else {
            callback(writeError);
          }
        });
      } else {
        callback(openError);
      }
    });
  },
  read: function(dir, filename, callback) {
    const pathToRead = `${this.baseDirectory}/${dir}/${filename}.json`;

    fs.readFile(pathToRead, "UTF-8", (error, data) => {
      callback(error, data);
    });
  },
  update: function(dir, filename, data, callback) {
    const pathToOpen = `${this.baseDirectory}/${dir}/${filename}.json`;

    fs.open(pathToOpen, "r+", (openError, fileDescriptor) => {
      if (!openError && fileDescriptor) {
        const fileContent = JSON.stringify(data);

        fs.ftruncate(fileDescriptor, error => {
          if (!error) {
            fs.writeFile(fileDescriptor, fileContent, writeError => {
              if (!writeError) {
                fs.close(fileDescriptor, closeError => {
                  if (!closeError) {
                    callback(false);
                  } else {
                    callback(closeError);
                  }
                });
              } else {
                callback(writeError);
              }
            });
          } else {
            callback(error);
          }
        });
      } else {
        callback(openError);
      }
    });
  },
  delete: function(dir, filename, callback) {
    const pathToDelete = `${this.baseDirectory}/${dir}/${filename}.json`;

    if (fs.existsSync(pathToDelete)) {
      fs.unlink(pathToDelete, error => {
        if (!error) {
          callback(false);
        } else {
          callback(error);
        }
      });
    } else {
      callback(false);
    }
  },
  baseDirectory: "./.data" // path.normalize(path.resolve(__dirname) + "/.data")
};

module.exports = lib;
