package rebootedmvp.dto;

import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.javatuples.*;

import rebootedmvp.domain.impl.BooleanEntry;
import rebootedmvp.domain.impl.PairImpl;
import rebootedmvp.domain.impl.UserProgress;

public class UserProgressDTO {
    private double totalProgress;
    private ArrayList<Pair<Double, ArrayList<Boolean>>> progress;

    public UserProgressDTO(UserProgress userProgress) {
        totalProgress = userProgress.getTotalProgress();
        List<PairImpl> temp = userProgress.getProgress();
        progress = temp
                .stream()
                .map(moduleData -> new Pair<>(
                        moduleData.getLeft(),
                        moduleData.getRight()
                                .stream()
                                .map(BooleanEntry::getValue)
                                .collect(Collectors.toCollection(ArrayList::new))))
                .collect(Collectors.toCollection(ArrayList::new));
    }

    public double getTotalProgress() {
        return totalProgress;
    }

    public void setTotalProgress(double totalProgress) {
        this.totalProgress = totalProgress;
    }

    public ArrayList<Pair<Double, ArrayList<Boolean>>> getProgress() {
        return progress;
    }

    public void setProgress(ArrayList<Pair<Double, ArrayList<Boolean>>> progress) {
        this.progress = progress;
    }

   

}
